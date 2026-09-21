import { useEffect, useMemo, useState } from 'react';
import { haversineKm, planSmartRoutes, type DistanceKmFn } from '../lib/smartRouting';
import { fetchNearestRoadPointsLimited, fetchRoadRoute, fetchRoadRoutesLimited } from '../lib/roadRouting';
import { buildMatrixDistanceFn, fetchDistanceMatrixKm } from '../lib/distanceMatrix';
import {
  applyHazardsToDistanceFn,
  insertDetourWaypoints,
  resolveClearOfHazard,
  type RoadHazard,
} from '../lib/roadHazards';
import { LatLng, RoutingPlanResult, Truck, TruckRoute, WasteContainer } from '../lib/wasteRoutingTypes';
import { HEBRON_CENTER, LANDFILL_POSITION } from '../components/mapGeo';

export interface SmartRoutingPlanState {
  trucks: Truck[];
  containers: WasteContainer[];
  plan: RoutingPlanResult;
  /** truckId -> ordered lat/lng path following real roads (or straight-line fallback until resolved) */
  roadGeometry: Record<string, LatLng[]>;
  /** Real-road path from the city out to the Al-Minya landfill - the only road leaving Hebron. */
  landfillRoute: LatLng[];
  isResolvingRoads: boolean;
  isRegenerating: boolean;
  regenerate: () => void;
  /** Whether the optimizer is currently scoring assignments by real road distance
   * (OSRM table) rather than straight-line - surfaced so the UI can be honest
   * about which mode produced the current plan, e.g. for a fleet too large for
   * a single table request. */
  isUsingRealRoadDistances: boolean;
}

function straightLineFallback(route: TruckRoute): LatLng[] {
  return [route.truck.depot, ...route.stops.map((s) => s.container.position), route.truck.depot];
}

/**
 * Resolves a real road-following path and guarantees it doesn't run through
 * an active closure: insertDetourWaypoints already steers the request away
 * from any closure its straight-line pre-check can see, but a curved street
 * can still swing through one that check missed entirely. This verifies the
 * *actual* returned geometry against every active hazard and, if it still
 * hits one, re-requests the route with an escalating corrective detour until
 * it actually clears - so a closure appearing on an already-resolved path
 * always ends up avoided, not just discouraged at the planning stage.
 */
async function resolveRoadPathAvoidingHazards(
  waypoints: LatLng[],
  hazards: RoadHazard[]
): Promise<LatLng[]> {
  const path = await fetchRoadRoute(waypoints);
  return resolveClearOfHazard(waypoints, path, hazards, fetchRoadRoute);
}

/**
 * Resolves a real fleet (trucks/containers, from either the demo generator
 * or the municipality's own entered data - see useFleetDataSource) into a
 * routing plan: snaps containers to the nearest real road, fetches a real
 * road-network distance matrix to score the optimizer's assignments,
 * computes the plan, and resolves each truck's stop sequence into a real
 * road-following polyline via OSRM. Shared by the map, route plan, drivers &
 * vehicles, and alerts pages so they all show the same plan.
 */
export function useSmartRoutingPlan(
  trucks: Truck[],
  rawContainers: WasteContainer[],
  hazards: RoadHazard[] = [],
  onRegenerateData?: () => void
): SmartRoutingPlanState {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const [roadGeometry, setRoadGeometry] = useState<Record<string, LatLng[]>>({});
  const [isResolvingRoads, setIsResolvingRoads] = useState(false);
  const [landfillRoute, setLandfillRoute] = useState<LatLng[]>([HEBRON_CENTER, LANDFILL_POSITION]);
  const [containers, setContainers] = useState<WasteContainer[]>(rawContainers);
  const [distanceKm, setDistanceKm] = useState<DistanceKmFn>(() => haversineKm);
  const [isUsingRealRoadDistances, setIsUsingRealRoadDistances] = useState(false);

  // Marked closures/traffic jams sit on top of whichever base metric is
  // active (real road distance or its haversine fallback), so the optimizer
  // avoids them regardless of which one is currently resolved.
  const effectiveDistanceKm = useMemo(
    () => applyHazardsToDistanceFn(distanceKm, hazards),
    [distanceKm, hazards]
  );

  const plan = useMemo(
    () => planSmartRoutes(trucks, containers, effectiveDistanceKm),
    [trucks, containers, effectiveDistanceKm]
  );

  // Mock containers are dropped at a random point within the city bounds
  // (and even real entered addresses can be a little off); snap every one to
  // the nearest real road once, then plan/route off the snapped set - trucks
  // only ever need to stop where a street actually is.
  useEffect(() => {
    let cancelled = false;
    setContainers(rawContainers);

    const snapped = rawContainers.map((c) => ({ ...c }));
    fetchNearestRoadPointsLimited(
      rawContainers,
      (c) => c.position,
      (container, position) => {
        const index = snapped.findIndex((c) => c.id === container.id);
        if (index !== -1) snapped[index] = { ...snapped[index], position };
      }
    ).then(() => {
      if (!cancelled) setContainers(snapped);
    });

    return () => {
      cancelled = true;
    };
  }, [rawContainers]);

  // Score the optimizer by real road-network distance instead of
  // straight-line: fetch a distance matrix (once, via OSRM's table service)
  // over every depot + container, and use it as planSmartRoutes' cost
  // function. Falls back to (and starts on) haversine while this resolves
  // or if the fleet is too large for a single table request.
  useEffect(() => {
    let cancelled = false;
    setDistanceKm(() => haversineKm);
    setIsUsingRealRoadDistances(false);

    const depotPoints: LatLng[] = [];
    const seenDepots = new Set<string>();
    trucks.forEach((truck) => {
      const key = `${truck.depot[0]},${truck.depot[1]}`;
      if (!seenDepots.has(key)) {
        seenDepots.add(key);
        depotPoints.push(truck.depot);
      }
    });
    const points = [...depotPoints, ...containers.map((c) => c.position)];
    if (points.length < 2) return;

    fetchDistanceMatrixKm(points).then((matrixKm) => {
      if (cancelled || !matrixKm) return;
      setDistanceKm(() => buildMatrixDistanceFn(points, matrixKm, haversineKm));
      setIsUsingRealRoadDistances(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trucks, containers, retryTick]);

  useEffect(() => {
    let cancelled = false;

    // Show the direct-connection paths immediately, then upgrade each one to
    // the real road route as it resolves - never leaves the map blank.
    setRoadGeometry(Object.fromEntries(plan.routes.map((r) => [r.truck.id, straightLineFallback(r)])));

    if (plan.routes.length === 0) {
      setIsResolvingRoads(false);
      return;
    }

    setIsResolvingRoads(true);
    fetchRoadRoutesLimited(
      plan.routes,
      (route) => insertDetourWaypoints(straightLineFallback(route), hazards),
      (route, path) => {
        if (cancelled) return;
        setRoadGeometry((prev) => ({ ...prev, [route.truck.id]: path }));

        // The preemptive check above only tests the straight line between
        // stops; verify the real returned geometry too, in case a curved
        // street swings through a closure that check couldn't see.
        resolveClearOfHazard(
          insertDetourWaypoints(straightLineFallback(route), hazards),
          path,
          hazards,
          fetchRoadRoute
        ).then((correctedPath) => {
          if (correctedPath !== path && !cancelled) {
            setRoadGeometry((prev) => ({ ...prev, [route.truck.id]: correctedPath }));
          }
        });
      },
      3
    ).finally(() => {
      if (!cancelled) setIsResolvingRoads(false);
    });

    return () => {
      cancelled = true;
    };
  }, [plan, hazards]);

  // The road out to the landfill is otherwise fixed (the only way out of
  // Hebron), but still needs to detour if a closure lands on it - so this
  // re-resolves whenever the active hazard set changes, not just once.
  useEffect(() => {
    let cancelled = false;
    const waypoints = insertDetourWaypoints([HEBRON_CENTER, LANDFILL_POSITION], hazards);
    resolveRoadPathAvoidingHazards(waypoints, hazards).then((path) => {
      if (!cancelled) setLandfillRoute(path);
    });
    return () => {
      cancelled = true;
    };
  }, [hazards]);

  const regenerate = () => {
    setIsRegenerating(true);
    window.setTimeout(() => {
      onRegenerateData?.();
      setRetryTick((t) => t + 1);
      setIsRegenerating(false);
    }, 500);
  };

  return {
    trucks,
    containers,
    plan,
    roadGeometry,
    landfillRoute,
    isResolvingRoads,
    isRegenerating,
    regenerate,
    isUsingRealRoadDistances,
  };
}
