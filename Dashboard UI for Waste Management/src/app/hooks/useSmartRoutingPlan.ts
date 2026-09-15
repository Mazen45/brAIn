import { useEffect, useMemo, useState } from 'react';
import { generateMockContainers, generateMockTrucks } from '../lib/wasteFleetData';
import { planSmartRoutes } from '../lib/smartRouting';
import { fetchRoadRoute, fetchRoadRoutesLimited } from '../lib/roadRouting';
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
}

function straightLineFallback(route: TruckRoute): LatLng[] {
  return [route.truck.depot, ...route.stops.map((s) => s.container.position), route.truck.depot];
}

/**
 * Generates the mock fleet/containers, runs the smart routing algorithm, and
 * resolves each truck's stop sequence into a real road-following polyline via
 * OSRM. Shared by the main map and the Route Plan page so both show the same
 * routes.
 */
export function useSmartRoutingPlan(): SmartRoutingPlanState {
  const [seedTick, setSeedTick] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [roadGeometry, setRoadGeometry] = useState<Record<string, LatLng[]>>({});
  const [isResolvingRoads, setIsResolvingRoads] = useState(false);
  const [landfillRoute, setLandfillRoute] = useState<LatLng[]>([HEBRON_CENTER, LANDFILL_POSITION]);

  const trucks = useMemo(() => generateMockTrucks(1 + seedTick * 13), [seedTick]);
  const containers = useMemo(() => generateMockContainers(2 + seedTick * 29), [seedTick]);
  const plan = useMemo(() => planSmartRoutes(trucks, containers), [trucks, containers]);

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
      (route) => straightLineFallback(route),
      (route, path) => {
        if (cancelled) return;
        setRoadGeometry((prev) => ({ ...prev, [route.truck.id]: path }));
      },
      3
    ).finally(() => {
      if (!cancelled) setIsResolvingRoads(false);
    });

    return () => {
      cancelled = true;
    };
  }, [plan]);

  // Resolved once - the road out to the landfill doesn't depend on the fleet
  // plan, it's the fixed, single way out of Hebron.
  useEffect(() => {
    let cancelled = false;
    fetchRoadRoute([HEBRON_CENTER, LANDFILL_POSITION]).then((path) => {
      if (!cancelled) setLandfillRoute(path);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const regenerate = () => {
    setIsRegenerating(true);
    window.setTimeout(() => {
      setSeedTick((t) => t + 1);
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
  };
}
