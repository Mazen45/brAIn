import { LatLng } from './wasteRoutingTypes';
import { haversineKm, type DistanceKmFn } from './smartRouting';

export interface RoadHazard {
  id: string;
  label: string;
  position: LatLng;
  /** How far from the marked point the closure is treated as affecting travel. */
  radiusKm: number;
  active: boolean;
  createdAt: number;
}

// Closures don't make a stop literally unreachable (a real dispatcher can
// always detour), but this flat penalty is large enough that the optimizer
// will only route through one when every other option is worse.
const CLOSURE_PENALTY_KM = 50;

function isPointNearHazard(point: LatLng, hazard: RoadHazard): boolean {
  return haversineKm(point, hazard.position) <= hazard.radiusKm;
}

/** Whether a straight hop between two points passes close enough to a closure
 * to be considered affected by it. This is a straight-line approximation
 * (endpoints + midpoint) since the optimizer scores hops before any real
 * road geometry is resolved - see the honesty note in the map legend about
 * what this can and can't guarantee. */
function isSegmentAffected(a: LatLng, b: LatLng, hazard: RoadHazard): boolean {
  if (isPointNearHazard(a, hazard) || isPointNearHazard(b, hazard)) return true;
  const midpoint: LatLng = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return isPointNearHazard(midpoint, hazard);
}

/**
 * Wraps a distance function so the optimizer treats hops near an active road
 * closure as far more expensive - steering truck/container assignments and
 * stop ordering away from them - without needing a routing server that
 * understands custom closures (the public OSRM demo doesn't).
 */
export function applyHazardsToDistanceFn(base: DistanceKmFn, hazards: RoadHazard[]): DistanceKmFn {
  const activeHazards = hazards.filter((h) => h.active);
  if (activeHazards.length === 0) return base;

  return (a, b) => {
    let flatPenaltyKm = 0;
    for (const hazard of activeHazards) {
      if (isSegmentAffected(a, b, hazard)) flatPenaltyKm += CLOSURE_PENALTY_KM;
    }
    return base(a, b) + flatPenaltyKm;
  };
}

/** How far outside a closure's own radius a forced detour point is pushed,
 * so the requested waypoint clearly falls on a road OSRM won't route back
 * through the closed area to reach. A small margin (e.g. 1.4x the radius)
 * sounds like enough but empirically isn't: in a real street grid, a point
 * just outside the closure circle is often still on the same blocked road,
 * or on an immediately adjacent one that still funnels back through it -
 * this needs to clear the whole local block, not just the drawn circle. */
const DETOUR_CLEARANCE_FACTOR = 1.4;

/** Escalating clearance multipliers tried, in order, until the resolved
 * route actually clears the hazard - see resolveClearOfHazard. */
const CORRECTIVE_CLEARANCE_FACTORS = [3, 6, 12];

/** Metres-per-degree is not constant, but at city scale a simple equirectangular
 * offset is more than accurate enough to place a detour point a known distance
 * away from a hazard - this never needs to be precise, just clearly outside
 * the closure radius. */
function offsetPoint(from: LatLng, bearingVector: [number, number], distanceKm: number): LatLng {
  const [dLat, dLng] = bearingVector;
  const length = Math.hypot(dLat, dLng) || 1;
  const latKmPerDeg = 110.574;
  const lngKmPerDeg = 111.320 * Math.cos((from[0] * Math.PI) / 180);
  return [
    from[0] + (dLat / length) * (distanceKm / latKmPerDeg),
    from[1] + (dLng / length) * (distanceKm / lngKmPerDeg),
  ];
}

/** Rotates a 2D vector by an angle in degrees. 90 gives the direction
 * perpendicular to travel - pushing a detour point *sideways* off the
 * direct line rather than further along it, since pushing "away from the
 * hazard toward the destination" is nearly colinear with the original hop
 * and the shortest real road to that point usually still runs straight past
 * the closure. Angles other than 90 give resolveClearOfHazard a few
 * additional directions to try when a pure sideways push lands just short
 * of clearing the radius (a real street rarely runs exactly perpendicular
 * to the original stop-to-stop line). */
function rotate(vector: [number, number], degrees: number): [number, number] {
  const radians = (degrees * Math.PI) / 180;
  const [x, y] = vector;
  return [x * Math.cos(radians) - y * Math.sin(radians), x * Math.sin(radians) + y * Math.cos(radians)];
}

function perpendicular(vector: [number, number]): [number, number] {
  return rotate(vector, 90);
}

/** Direction angles (degrees off the perpendicular) tried by
 * resolveClearOfHazard alongside the escalating distance and left/right
 * side - a small spread around straight-sideways, not a full compass
 * search, since the real road is usually roughly perpendicular-ish to the
 * original hop wherever it actually runs. */
const CORRECTIVE_ANGLE_OFFSETS = [0, 30, -30];

/**
 * Given an ordered list of waypoints (a truck's depot -> stops -> depot, or
 * any two-point hop), returns a new list with an extra via-point inserted on
 * every leg that passes close to an active closure - forcing the real
 * road-routing request (see roadRouting.ts) to actually detour around it,
 * rather than only discouraging the optimizer from choosing that leg in the
 * first place. If a leg's own endpoint sits inside the closure radius (the
 * destination itself is at the closure), no detour is inserted for that leg,
 * since there is no way to reach that stop without entering the area.
 */
export function insertDetourWaypoints(waypoints: LatLng[], hazards: RoadHazard[]): LatLng[] {
  const activeHazards = hazards.filter((h) => h.active);
  if (activeHazards.length === 0 || waypoints.length < 2) return waypoints;

  const result: LatLng[] = [waypoints[0]];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];

    for (const hazard of activeHazards) {
      const endpointInsideClosure =
        isPointNearHazard(a, hazard) || isPointNearHazard(b, hazard);
      if (endpointInsideClosure) continue;

      if (!isSegmentAffected(a, b, hazard)) continue;

      const travel: [number, number] = [b[0] - a[0], b[1] - a[1]];
      const sideways = perpendicular(travel);
      const detour = offsetPoint(hazard.position, sideways, hazard.radiusKm * DETOUR_CLEARANCE_FACTOR);
      result.push(detour);
      // Only the first closure found on this leg gets a detour point; two
      // active closures overlapping the exact same leg is an edge case this
      // simple one-point-per-leg approach doesn't handle, but is rare enough
      // (and each still gets scored as expensive by applyHazardsToDistanceFn)
      // not to be worth chained detour points for.
      break;
    }

    result.push(b);
  }

  return result;
}

export interface HazardHit {
  hazard: RoadHazard;
  /** The actual point on the resolved path where it entered the closure's
   * radius. */
  point: LatLng;
  /** A point a little earlier on the same path, used to establish the real
   * local direction of travel at the hit - a multi-stop route's overall
   * shape can bear no resemblance to the road's actual direction at any one
   * point along it, so this is what makes the corrective push aim sideways
   * relative to the real street, not an unrelated stop-to-stop line. */
  approachPoint: LatLng;
}

/** How many points back along the path to look for the approach point -
 * OSRM geometry points are typically a few metres apart, so this spans
 * roughly 20-50m, enough to get a stable local bearing without averaging
 * over a stretch long enough to curve significantly itself. */
const APPROACH_LOOKBACK_POINTS = 5;

/**
 * Checks a resolved road path's *actual* geometry against every active
 * closure, point by point - unlike insertDetourWaypoints (which only tests
 * the straight line between two stops before any real road is known), this
 * catches a curved street that happens to swing through a closure's radius
 * even though neither endpoint, nor the straight-line midpoint, of that hop
 * was ever near it. Returns the first hit found on the path, or null if the
 * path is genuinely clear.
 */
export function findHazardOnPath(path: LatLng[], hazards: RoadHazard[]): HazardHit | null {
  const activeHazards = hazards.filter((h) => h.active);
  for (const hazard of activeHazards) {
    const hitIndex = path.findIndex((point) => isPointNearHazard(point, hazard));
    if (hitIndex === -1) continue;
    const approachIndex = Math.max(0, hitIndex - APPROACH_LOOKBACK_POINTS);
    return { hazard, point: path[hitIndex], approachPoint: path[approachIndex] };
  }
  return null;
}

/**
 * Corrective follow-up to findHazardOnPath: inserts one more detour point
 * for a hazard hit that a resolved path was found to actually pass through.
 * The push direction comes from the hit's real local approach direction on
 * the actual road (not the sparse stop-to-stop waypoints - with several
 * stops on a route, the nearest waypoint's neighbours can point in a
 * completely different direction than the street actually runs at the
 * point of intersection), while the insertion *position* in the waypoints
 * list still comes from whichever original waypoint sits closest to the
 * hazard, since that's the only ordering information available before a
 * route is resolved. clearanceFactor and side are escalated by
 * resolveClearOfHazard until the result actually clears.
 */
export function insertCorrectiveDetour(
  waypoints: LatLng[],
  hit: HazardHit,
  clearanceFactor: number,
  side: 1 | -1 = 1,
  insertBefore: boolean = false,
  angleOffset: number = 0
): LatLng[] {
  const { hazard, point, approachPoint } = hit;

  let nearestIndex = 0;
  let nearestDistance = Infinity;
  waypoints.forEach((wp, i) => {
    const distance = haversineKm(wp, hazard.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  });

  const travel: [number, number] = [point[0] - approachPoint[0], point[1] - approachPoint[1]];
  const sideways = rotate(travel, 90 + angleOffset);
  const direction: [number, number] = [sideways[0] * side, sideways[1] * side];
  const detour = offsetPoint(hazard.position, direction, hazard.radiusKm * clearanceFactor);

  // A stop that sits close to a hazard can have BOTH the leg leading into it
  // and the leg leading out of it pass close to the closure - inserting only
  // after nearestIndex fixes the outgoing leg but leaves the incoming one
  // (nearestIndex-1 -> nearestIndex) completely untouched, since OSRM
  // resolves each leg independently of what comes before or after it.
  // insertBefore lets resolveClearOfHazard address that other side too.
  const insertAt = insertBefore ? Math.max(nearestIndex, 1) : nearestIndex + 1;
  return [...waypoints.slice(0, insertAt), detour, ...waypoints.slice(insertAt)];
}

/** Cap on how many separate corrective detours resolveClearOfHazard will
 * chain together for a single hazard hit - a stop sitting close to a
 * closure can have both its incoming and outgoing leg affected, needing two
 * separate corrections, but this stays bounded rather than searching
 * indefinitely against the live routing service. */
const MAX_CORRECTION_ROUNDS = 4;

/** How close, in km, any point of a resolved path comes to a hazard's
 * center - used to objectively compare candidate corrections against each
 * other (and against the current state) rather than accepting the first
 * one found that merely moves the problem, which can plateau short of
 * actually clearing the closure's radius. */
function closestApproachKm(path: LatLng[], hazard: RoadHazard): number {
  return Math.min(...path.map((point) => haversineKm(point, hazard.position)));
}

/**
 * Repeatedly re-requests a road route with an escalating, both-sides,
 * both-positions corrective detour until the resolved path actually clears
 * every active hazard, or no further progress can be made.
 *
 * A single hazard can affect more than one leg at once - e.g. a stop close
 * to a closure often has *both* the leg leading into it and the leg leading
 * out of it pass near the closure, and since OSRM resolves each leg
 * independently, fixing one never fixes the other. So each round searches
 * every clearance/side/position/angle combination and keeps whichever one
 * pushes the path objectively farthest from the hazard (not just the first
 * one that helps at all, which can plateau short of actually clearing the
 * radius) - then hands that result to the next round to keep working on,
 * in case a separate affected leg remains. It only gives up when a round's
 * best attempt is no better than where that round started.
 *
 * This is empirically effective when an alternate road genuinely exists
 * nearby - verified against the live OSRM service across a spread of real
 * multi-stop truck routes in the fleet's operating area - but it is not,
 * and cannot be, a universal guarantee: if a closure sits on the only road
 * connecting two points in the real network (a genuine chokepoint), no
 * waypoint placed anywhere will make OSRM invent a second road that doesn't
 * exist. In that case this returns its best attempt; see the map legend's
 * honesty note about this being a heuristic, not routing-server-level
 * closure awareness. fetchRoute is injected so this stays independent of
 * roadRouting.ts's OSRM specifics.
 */
export async function resolveClearOfHazard(
  waypoints: LatLng[],
  path: LatLng[],
  hazards: RoadHazard[],
  fetchRoute: (waypoints: LatLng[]) => Promise<LatLng[]>
): Promise<LatLng[]> {
  let currentWaypoints = waypoints;
  let currentPath = path;

  for (let round = 0; round < MAX_CORRECTION_ROUNDS; round++) {
    const hit = findHazardOnPath(currentPath, hazards);
    if (!hit) return currentPath;

    // If one of the route's own required waypoints (a stop the truck must
    // physically reach, or the depot) is itself inside the closure's
    // radius, no detour can help - the truck has no way to serve that stop
    // without entering the area, same as a real dispatcher would face.
    const requiredStopInsideClosure = currentWaypoints.some(
      (wp) => haversineKm(wp, hit.hazard.position) <= hit.hazard.radiusKm
    );
    if (requiredStopInsideClosure) return currentPath;

    const currentClosestApproach = closestApproachKm(currentPath, hit.hazard);
    let best: { waypoints: LatLng[]; path: LatLng[]; closestApproach: number } | null = null;
    let fullyCleared: LatLng[] | null = null;

    search: for (const clearanceFactor of CORRECTIVE_CLEARANCE_FACTORS) {
      for (const side of [1, -1] as const) {
        for (const insertBefore of [false, true]) {
          for (const angleOffset of CORRECTIVE_ANGLE_OFFSETS) {
            // Always detour from this round's current waypoints, not a
            // previous failed attempt within the same round - otherwise a
            // too-close correction stays in the list and keeps dragging
            // every later, larger attempt back past the hazard.
            const corrected = insertCorrectiveDetour(
              currentWaypoints,
              hit,
              clearanceFactor,
              side,
              insertBefore,
              angleOffset
            );
            const candidate = await fetchRoute(corrected);
            const closestApproach = closestApproachKm(candidate, hit.hazard);

            if (closestApproach > hit.hazard.radiusKm) {
              fullyCleared = candidate;
              break search;
            }
            // Track the objectively best attempt this round, not just the
            // first one that happens to help - a "first good enough" pick
            // can plateau just short of actually clearing the radius even
            // though a later, untried combination in the same round would
            // have succeeded.
            if (!best || closestApproach > best.closestApproach) {
              best = { waypoints: corrected, path: candidate, closestApproach };
            }
          }
        }
      }
    }

    if (fullyCleared) return fullyCleared;

    // Only keep this round's best attempt if it's a genuine improvement
    // over where this round started - otherwise every combination tried
    // made things no better, and further rounds from the same spot would
    // just repeat the same search with the same result.
    if (!best || best.closestApproach <= currentClosestApproach) return currentPath;
    currentWaypoints = best.waypoints;
    currentPath = best.path;
  }

  return currentPath;
}
