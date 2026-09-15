import { LatLng } from './wasteRoutingTypes';

// Public OSRM demo routing server - resolves a multi-stop driving route that
// follows the real road network. Waypoint order is preserved (this service
// does not reorder stops; our own smart-routing algorithm already picked the
// optimal visiting order, we just need the actual streets between them).
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

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
