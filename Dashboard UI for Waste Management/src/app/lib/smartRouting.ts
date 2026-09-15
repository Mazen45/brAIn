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
 * Goal: pick the smallest set of trucks and the shortest total travel
 * distance that still collects (almost) all of the waste that actually
 * needs collecting - i.e. minimize resources used (trucks, kilometers,
 * fuel/time) while maximizing results (liters of waste collected,
 * prioritizing containers that are close to overflowing).
 *
 * Pipeline:
 *   1. Filter: skip containers that are not "due" (low fill level) -
 *      visiting a near-empty container wastes fuel and driver time.
 *   2. Prioritize: score due containers by urgency (fill level + overflow
 *      risk + time since last pickup) so the fullest/oldest bins are
 *      served first when trucks are capacity-constrained.
 *   3. Construct: greedily assign each container, most urgent first, to
 *      whichever available truck can reach it most cheaply (nearest
 *      current position) without exceeding that truck's remaining
 *      capacity - a capacitated nearest-insertion heuristic.
 *   4. Improve: run 2-opt local search on each truck's resulting stop
 *      sequence to remove crossing/backtracking legs.
 *   5. Measure: compare against a naive baseline (dispatch the whole
 *      fleet, visit every container in raw order, no optimization) to
 *      quantify the resources saved.
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

function containerVolumeL(container: WasteContainer): number {
  return (container.fillLevel / 100) * container.capacityL;
}

export function urgencyScore(container: WasteContainer): number {
  const overflowBonus = container.fillLevel >= OVERFLOW_RISK_PERCENT ? 25 : 0;
  const agePenalty = Math.min(20, container.hoursSinceLastCollection / 4);
  return container.fillLevel + overflowBonus + agePenalty;
}

function tourDistanceKm(depot: LatLng, order: WasteContainer[]): number {
  if (order.length === 0) return 0;
  let total = haversineKm(depot, order[0].position);
  for (let i = 0; i < order.length - 1; i++) {
    total += haversineKm(order[i].position, order[i + 1].position);
  }
  total += haversineKm(order[order.length - 1].position, depot);
  return total;
}

/** Classic 2-opt local search: repeatedly reverse sub-segments while it shortens the tour. */
function twoOptImprove(depot: LatLng, initialOrder: WasteContainer[]): WasteContainer[] {
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
        if (tourDistanceKm(depot, candidate) < tourDistanceKm(depot, route) - 1e-6) {
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

export function planSmartRoutes(trucks: Truck[], containers: WasteContainer[]): RoutingPlanResult {
  const availableTrucks = trucks.filter((t) => t.status === 'available');

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

  for (const container of orderedByUrgency) {
    const volume = containerVolumeL(container);

    let best: TruckState | null = null;
    let bestDistance = Infinity;
    for (const state of truckStates) {
      if (state.assigned.length >= MAX_STOPS_PER_TRUCK) continue;
      if (state.remainingCapacityL < volume) continue;
      const distance = haversineKm(state.currentPosition, container.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = state;
      }
    }

    if (!best) {
      unassignedContainers.push(container);
      continue;
    }

    best.assigned.push(container);
    best.remainingCapacityL -= volume;
    best.currentPosition = container.position;
  }

  const routes: TruckRoute[] = truckStates
    .filter((state) => state.assigned.length > 0)
    .map((state) => {
      const optimizedOrder = twoOptImprove(state.truck.depot, state.assigned);

      let cumulative = 0;
      let loadLiters = 0;
      let prevPoint = state.truck.depot;
      const stops: RouteStop[] = optimizedOrder.map((container) => {
        const legDistanceKm = haversineKm(prevPoint, container.position);
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
      const totalDistanceKm = cumulative + haversineKm(prevPoint, state.truck.depot);
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

  const metrics = computeMetrics(trucks, availableTrucks, containers, dueContainers, routes);

  return { routes, unassignedContainers, skippedContainers, metrics };
}

/** Traditional/unoptimized baseline: dispatch the whole fleet and visit every
 * container round-robin in raw order, regardless of fill level. Used only to
 * quantify how many trucks and kilometers the smart plan saves. */
function planNaiveBaseline(trucks: Truck[], containers: WasteContainer[]) {
  const availableTrucks = trucks.filter((t) => t.status === 'available');
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
    totalDistance += tourDistanceKm(truck.depot, stops);
  });

  return { distanceKm: totalDistance, trucksUsed };
}

function computeMetrics(
  allTrucks: Truck[],
  availableTrucks: Truck[],
  allContainers: WasteContainer[],
  dueContainers: WasteContainer[],
  routes: TruckRoute[]
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

  const naive = planNaiveBaseline(allTrucks, allContainers);

  return {
    totalTrucks: allTrucks.length,
    availableTrucks: availableTrucks.length,
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
