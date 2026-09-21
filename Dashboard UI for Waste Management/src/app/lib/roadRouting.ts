import { LatLng } from './wasteRoutingTypes';

// Public OSRM demo routing server.
const OSRM_HOST = 'https://router.project-osrm.org';

// Resolves a multi-stop driving route that follows the real road network.
// Waypoint order is preserved (this service does not reorder stops; our own
// smart-routing algorithm already picked the optimal visiting order, we just
// need the actual streets between them).
const OSRM_BASE = `${OSRM_HOST}/route/v1/driving`;

const roadRouteCache = new Map<string, LatLng[]>();

function cacheKey(waypoints: LatLng[]): string {
  return waypoints.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join(';');
}

/**
 * Resolves the road-following polyline through an ordered list of stops.
 * Falls back to straight lines between the waypoints (still in the correct
 * visiting order) if the routing service is unreachable, offline, or
 * rate-limited, so the map always renders a usable route.
 */
export async function fetchRoadRoute(waypoints: LatLng[]): Promise<LatLng[]> {
  if (waypoints.length < 2) return waypoints;

  const key = cacheKey(waypoints);
  const cached = roadRouteCache.get(key);
  if (cached) return cached;

  const coordsParam = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_BASE}/${coordsParam}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM request failed with status ${response.status}`);
    const data = await response.json();
    const coordinates: [number, number][] | undefined = data?.routes?.[0]?.geometry?.coordinates;
    if (!coordinates || coordinates.length === 0) throw new Error('OSRM returned no route geometry');

    const path: LatLng[] = coordinates.map(([lng, lat]) => [lat, lng]);
    roadRouteCache.set(key, path);
    return path;
  } catch {
    // Offline, blocked, or rate-limited - straight segments keep the map usable.
    roadRouteCache.set(key, waypoints);
    return waypoints;
  }
}

/** Runs fetchRoadRoute over many routes with limited concurrency, so we don't
 * fire dozens of simultaneous requests at the public demo server at once. */
export async function fetchRoadRoutesLimited<T>(
  items: T[],
  getWaypoints: (item: T) => LatLng[],
  onResolved: (item: T, path: LatLng[]) => void,
  concurrency = 3
): Promise<void> {
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      const path = await fetchRoadRoute(getWaypoints(item));
      onResolved(item, path);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

const nearestRoadCache = new Map<string, LatLng>();

/**
 * Snaps a point to the nearest drivable road via OSRM's Nearest service, so
 * mock container positions (dropped at a random lat/lng) end up on an actual
 * street instead of inside a building block a truck could never reach. Falls
 * back to the original point if the service is unreachable.
 */
export async function fetchNearestRoadPoint(point: LatLng): Promise<LatLng> {
  const key = point.map((c) => c.toFixed(5)).join(',');
  const cached = nearestRoadCache.get(key);
  if (cached) return cached;

  const [lat, lng] = point;
  const url = `${OSRM_HOST}/nearest/v1/driving/${lng},${lat}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM nearest request failed with status ${response.status}`);
    const data = await response.json();
    const location: [number, number] | undefined = data?.waypoints?.[0]?.location;
    if (!location) throw new Error('OSRM returned no nearest-road match');

    const snapped: LatLng = [location[1], location[0]];
    nearestRoadCache.set(key, snapped);
    return snapped;
  } catch {
    nearestRoadCache.set(key, point);
    return point;
  }
}

/** Runs fetchNearestRoadPoint over many points with limited concurrency. */
export async function fetchNearestRoadPointsLimited<T>(
  items: T[],
  getPoint: (item: T) => LatLng,
  onResolved: (item: T, point: LatLng) => void,
  concurrency = 5
): Promise<void> {
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      const point = await fetchNearestRoadPoint(getPoint(item));
      onResolved(item, point);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}
