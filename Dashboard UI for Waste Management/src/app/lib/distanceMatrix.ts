import { LatLng } from './wasteRoutingTypes';

const OSRM_TABLE_URL = 'https://router.project-osrm.org/table/v1/driving';

// The public OSRM demo server caps table requests; past this many points a
// single request risks a timeout or a rejected request, so we fall back to
// straight-line distance rather than let a huge municipality dataset break
// the optimizer entirely.
const MAX_MATRIX_POINTS = 100;

export type DistanceKmFn = (a: LatLng, b: LatLng) => number;

function pointKey(point: LatLng): string {
  return `${point[0].toFixed(6)},${point[1].toFixed(6)}`;
}

/**
 * Fetches a real road-network distance matrix (in km) between every pair of
 * the given points via OSRM's Table service - one request instead of
 * O(n^2) individual route requests. Returns null (caller should fall back
 * to haversine) if there are too many points or the request fails.
 */
export async function fetchDistanceMatrixKm(points: LatLng[]): Promise<number[][] | null> {
  if (points.length < 2) return null;
  if (points.length > MAX_MATRIX_POINTS) return null;

  const coordsParam = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_TABLE_URL}/${coordsParam}?annotations=distance`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM table request failed with status ${response.status}`);
    const data = await response.json();
    const distancesMeters: number[][] | undefined = data?.distances;
    if (!distancesMeters) throw new Error('OSRM table response missing distances');
    return distancesMeters.map((row) => row.map((meters) => (meters == null ? Infinity : meters / 1000)));
  } catch {
    return null;
  }
}

/**
 * Wraps a fetched distance matrix into a (a, b) => km lookup function keyed
 * by coordinate, for use as planSmartRoutes' distance metric. Points not in
 * the original matrix (shouldn't normally happen, since callers build the
 * matrix from the exact same point set the algorithm will query) fall back
 * to the given default so the optimizer never breaks on a lookup miss.
 */
export function buildMatrixDistanceFn(
  points: LatLng[],
  matrixKm: number[][],
  fallback: DistanceKmFn
): DistanceKmFn {
  const indexOf = new Map<string, number>();
  points.forEach((point, index) => indexOf.set(pointKey(point), index));

  return (a, b) => {
    const ai = indexOf.get(pointKey(a));
    const bi = indexOf.get(pointKey(b));
    if (ai === undefined || bi === undefined) return fallback(a, b);
    const km = matrixKm[ai]?.[bi];
    return typeof km === 'number' && Number.isFinite(km) ? km : fallback(a, b);
  };
}
