import {
  LatLng,
  RouteStop,
  RoutingMetrics,
  RoutingPlanResult,
  Truck,
  TruckRoute,
  WasteContainer,
} from './wasteRoutingTypes';

/**
 * Smart Waste Collection Routing algorithm.
 *
 * Goal: every available truck/driver should be out on a route today - under
 * normal circumstances (enough due containers to go around) the fleet's
 * utilization should be 100%, not just some subset of it - while still
 * minimizing the total distance driven and prioritizing containers that are
 * close to overflowing.
 *
 * Pipeline:
 *   1. Filter: skip containers that are not "due" (low fill level) -
 *      visiting a near-empty container wastes fuel and driver time.
 *   2. Prioritize: score due containers by urgency (fill level + overflow
 *      risk + time since last pickup) so the fullest/oldest bins are
 *      served first when trucks are capacity-constrained.
 *   3. Seed: give every truck its own nearest due container first (by
 *      distance to its depot, not urgency), so each truck's route is
 *      anchored close to home from the start instead of getting whichever
 *      distant container was still unclaimed once the trucks near it were
 *      already busy.
 *   4. Construct: assign the remaining due containers, most urgent first,
 *      to whichever eligible truck can reach it most cheaply (nearest
 *      current position) without exceeding that truck's remaining
 *      capacity - a capacitated nearest-insertion heuristic that now
 *      naturally stays local, since every truck already has a nearby
 *      anchor stop from the seeding pass.
 *   5. Improve: run 2-opt local search on each truck's resulting stop
 *      sequence to remove crossing/backtracking legs.
 *   6. Measure: compare against a naive baseline (dispatch the whole
 *      fleet, visit every container in raw order, no optimization) to
 *      quantify the distance saved by prioritization and route ordering.
 */

export const COLLECTION_THRESHOLD_PERCENT = 60; // containers below this are skipped
export const OVERFLOW_RISK_PERCENT = 90;
export const MAX_STOPS_PER_TRUCK = 14;
const SERVICE_MINUTES_PER_STOP = 4;

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** (a, b) => km. Every distance query in this module goes through one of
 * these so the whole algorithm can run on real road-network distances
 * (see distanceMatrix.ts) instead of straight-line haversine, without
 * changing any of the logic below. */
export type DistanceKmFn = (a: LatLng, b: LatLng) => number;

function containerVolumeL(container: WasteContainer): number {
  return (container.fillLevel / 100) * container.capacityL;
}

export function urgencyScore(container: WasteContainer): number {
  const overflowBonus = container.fillLevel >= OVERFLOW_RISK_PERCENT ? 25 : 0;
  const agePenalty = Math.min(20, container.hoursSinceLastCollection / 4);
  return container.fillLevel + overflowBonus + agePenalty;
}

function tourDistanceKm(depot: LatLng, order: WasteContainer[], distanceKm: DistanceKmFn): number {
  if (order.length === 0) return 0;
  let total = distanceKm(depot, order[0].position);
  for (let i = 0; i < order.length - 1; i++) {
    total += distanceKm(order[i].position, order[i + 1].position);
  }
  total += distanceKm(order[order.length - 1].position, depot);
  return total;
}

/** Classic 2-opt local search: repeatedly reverse sub-segments while it shortens the tour. */
function twoOptImprove(
  depot: LatLng,
  initialOrder: WasteContainer[],
  distanceKm: DistanceKmFn
): WasteContainer[] {
  let route = [...initialOrder];
  if (route.length < 3) return route;

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const candidate = [
          ...route.slice(0, i),
          ...route.slice(i, j + 1).reverse(),
          ...route.slice(j + 1),
        ];
        if (
          tourDistanceKm(depot, candidate, distanceKm) <
          tourDistanceKm(depot, route, distanceKm) - 1e-6
        ) {
          route = candidate;
          improved = true;
        }
      }
    }
  }
  return route;
}

interface TruckState {
  truck: Truck;
  currentPosition: LatLng;
  remainingCapacityL: number;
  assigned: WasteContainer[];
}

/** A truck can only be dispatched when it's mechanically fine AND its driver
 * is present today - either one being false takes it out of service. */
function isTruckAvailable(truck: Truck): boolean {
  return truck.status === 'available' && truck.driverAvailable;
}

export function planSmartRoutes(
  trucks: Truck[],
  containers: WasteContainer[],
  distanceKm: DistanceKmFn = haversineKm
): RoutingPlanResult {
  const availableTrucks = trucks.filter(isTruckAvailable);

  const dueContainers = containers.filter((c) => c.fillLevel >= COLLECTION_THRESHOLD_PERCENT);
  const skippedContainers = containers.filter((c) => c.fillLevel < COLLECTION_THRESHOLD_PERCENT);

  const orderedByUrgency = [...dueContainers].sort((a, b) => urgencyScore(b) - urgencyScore(a));

  const truckStates: TruckState[] = availableTrucks.map((truck) => ({
    truck,
    currentPosition: truck.depot,
    remainingCapacityL: truck.capacityL,
    assigned: [],
  }));

  const unassignedContainers: WasteContainer[] = [];

  // Phase 1 - seed every truck with its own nearest due container. Doing
  // this by distance-to-depot (one pass per truck) rather than by global
  // urgency order means each truck's first stop is always right near its
  // own depot: with 17 trucks pulling from only 4 depots, picking urgency
  // order first would frequently exhaust the idle trucks near one urgent
  // cluster before it, forcing a truck from a depot across town to take the
  // next urgent container just because it was still idle - a driver sent
  // far outside the area their own route is actually anchored to.
  const remainingDue = [...orderedByUrgency];
  for (const state of truckStates) {
    if (remainingDue.length === 0) break;

    let bestIndex = -1;
    let bestDistance = Infinity;
    for (let i = 0; i < remainingDue.length; i++) {
      if (containerVolumeL(remainingDue[i]) > state.remainingCapacityL) continue;
      const distance = distanceKm(state.currentPosition, remainingDue[i].position);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    if (bestIndex === -1) continue; // nothing this truck can carry, e.g. an unusually large container

    const [container] = remainingDue.splice(bestIndex, 1);
    const volume = containerVolumeL(container);
    state.assigned.push(container);
    state.remainingCapacityL -= volume;
    state.currentPosition = container.position;
  }

  // Phase 2 - fill in the rest by urgency. Every truck that could be seeded
  // already has a local anchor point from phase 1, so plain nearest-truck
  // assignment naturally keeps each truck's additional stops close to the
  // route it already has instead of needing an idle-truck preference.
  for (const container of remainingDue) {
    const volume = containerVolumeL(container);

    const eligible = truckStates.filter(
      (state) => state.assigned.length < MAX_STOPS_PER_TRUCK && state.remainingCapacityL >= volume
    );

    if (eligible.length === 0) {
      unassignedContainers.push(container);
      continue;
    }

    let best = eligible[0];
    let bestDistance = distanceKm(eligible[0].currentPosition, container.position);
    for (const state of eligible.slice(1)) {
      const distance = distanceKm(state.currentPosition, container.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = state;
      }
    }

    best.assigned.push(container);
    best.remainingCapacityL -= volume;
    best.currentPosition = container.position;
  }

  const routes: TruckRoute[] = truckStates
    .filter((state) => state.assigned.length > 0)
    .map((state) => {
      const optimizedOrder = twoOptImprove(state.truck.depot, state.assigned, distanceKm);

      let cumulative = 0;
      let loadLiters = 0;
      let prevPoint = state.truck.depot;
      const stops: RouteStop[] = optimizedOrder.map((container) => {
        const legDistanceKm = distanceKm(prevPoint, container.position);
        cumulative += legDistanceKm;
        loadLiters += containerVolumeL(container);
        prevPoint = container.position;
        return {
          container,
          legDistanceKm,
          cumulativeDistanceKm: cumulative,
          collectedLiters: containerVolumeL(container),
        };
      });
      const totalDistanceKm = cumulative + distanceKm(prevPoint, state.truck.depot);
      const totalDurationMin =
        (totalDistanceKm / state.truck.avgSpeedKmh) * 60 + stops.length * SERVICE_MINUTES_PER_STOP;

      return {
        truck: state.truck,
        stops,
        totalDistanceKm,
        totalDurationMin,
        loadLiters,
        loadPercent: (loadLiters / state.truck.capacityL) * 100,
      };
    })
    .sort((a, b) => b.loadLiters - a.loadLiters);

  const metrics = computeMetrics(trucks, availableTrucks, containers, dueContainers, routes, distanceKm);

  return { routes, unassignedContainers, skippedContainers, metrics };
}

/** Traditional/unoptimized baseline: dispatch the whole fleet and visit every
 * container round-robin in raw order, regardless of fill level. Used only to
 * quantify how many trucks and kilometers the smart plan saves. */
function planNaiveBaseline(trucks: Truck[], containers: WasteContainer[], distanceKm: DistanceKmFn) {
  const availableTrucks = trucks.filter(isTruckAvailable);
  if (availableTrucks.length === 0 || containers.length === 0) {
    return { distanceKm: 0, trucksUsed: 0 };
  }

  const buckets: WasteContainer[][] = availableTrucks.map(() => []);
  containers.forEach((container, i) => {
    buckets[i % availableTrucks.length].push(container);
  });

  let totalDistance = 0;
  let trucksUsed = 0;
  availableTrucks.forEach((truck, i) => {
    const stops = buckets[i];
    if (stops.length === 0) return;
    trucksUsed += 1;
    totalDistance += tourDistanceKm(truck.depot, stops, distanceKm);
  });

  return { distanceKm: totalDistance, trucksUsed };
}

function computeMetrics(
  allTrucks: Truck[],
  availableTrucks: Truck[],
  allContainers: WasteContainer[],
  dueContainers: WasteContainer[],
  routes: TruckRoute[],
  distanceKm: DistanceKmFn
): RoutingMetrics {
  const collectedContainers = routes.reduce((sum, r) => sum + r.stops.length, 0);
  const totalWasteCollectedLiters = routes.reduce((sum, r) => sum + r.loadLiters, 0);
  const totalWasteDueLiters = dueContainers.reduce(
    (sum, c) => sum + (c.fillLevel / 100) * c.capacityL,
    0
  );
  const totalDistanceKm = routes.reduce((sum, r) => sum + r.totalDistanceKm, 0);
  const trucksUsed = routes.length;
  const avgLoadPercent = trucksUsed > 0 ? routes.reduce((s, r) => s + r.loadPercent, 0) / trucksUsed : 0;

  const naive = planNaiveBaseline(allTrucks, allContainers, distanceKm);

  return {
    totalTrucks: allTrucks.length,
    availableTrucks: availableTrucks.length,
    driversUnavailable: allTrucks.filter((t) => !t.driverAvailable).length,
    vehiclesOutOfService: allTrucks.filter((t) => t.status === 'maintenance').length,
    trucksUsed,
    totalContainers: allContainers.length,
    dueContainers: dueContainers.length,
    collectedContainers,
    totalWasteCollectedLiters,
    totalWasteDueLiters,
    totalDistanceKm,
    avgLoadPercent,
    litersPerKm: totalDistanceKm > 0 ? totalWasteCollectedLiters / totalDistanceKm : 0,
    naiveDistanceKm: naive.distanceKm,
    naiveTrucksUsed: naive.trucksUsed,
    distanceSavedPercent:
      naive.distanceKm > 0 ? ((naive.distanceKm - totalDistanceKm) / naive.distanceKm) * 100 : 0,
    trucksSavedCount: Math.max(0, naive.trucksUsed - trucksUsed),
  };
}
