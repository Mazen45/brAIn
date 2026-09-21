import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { LatLng as LeafletLatLng, LatLngBoundsExpression, LeafletMouseEvent } from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
  ZoomControl,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import { MapLegend } from './MapLegend';
import { QuickDetailsPanel } from './QuickDetailsPanel';
import { VehicleMarker } from './VehicleMarker';
import { RouteLayer } from './RouteLayer';
import { MapControls } from './MapControls';
import { VehicleTooltip } from './VehicleTooltip';
import { WasteContainerMarker } from './WasteContainerMarker';
import { HeatmapLayer } from './HeatmapLayer';
import { RoadHazardMarker } from './RoadHazardMarker';
import { AddHazardForm } from './AddHazardForm';
import { LANDFILL_NAME, LANDFILL_POSITION, MAP_DEFAULT_VIEW_CENTER, MAP_MAX_BOUNDS } from './mapGeo';
import type { SmartRoutingPlanState } from '../hooks/useSmartRoutingPlan';
import type { RoadHazardsState } from '../hooks/useRoadHazards';
import { routeColor } from '../lib/routeColors';
import { depotIcon, landfillIcon } from '../lib/mapIcons';
import { haversineKm } from '../lib/smartRouting';
import { PLAN_MODIFICATIONS_TODAY } from '../lib/wasteFleetData';
import type { LatLng } from '../lib/wasteRoutingTypes';

// Containers are snapped to the nearest road (see useSmartRoutingPlan), but
// the resolved route polyline can still pick a slightly different point on
// that same road segment. Snap the truck's displayed position to the nearest
// vertex of its resolved, road-following route instead, so it always renders
// on the line rather than floating just off it.
function nearestPointOnPath(point: LatLng, path: LatLng[]): LatLng {
  if (path.length === 0) return point;
  let best = path[0];
  let bestDistanceKm = haversineKm(point, path[0]);
  for (let i = 1; i < path.length; i++) {
    const distanceKm = haversineKm(point, path[i]);
    if (distanceKm < bestDistanceKm) {
      bestDistanceKm = distanceKm;
      best = path[i];
    }
  }
  return best;
}

export interface Vehicle {
  id: string;
  driver: string;
  status: 'active' | 'inactive';
  route: string;
  position: [number, number];
  /** Matches the color of this truck's route line on the map, when it has one assigned. */
  color?: string;
}

export interface Route {
  id: string;
  type: 'normal' | 'modified' | 'cancelled';
  points: Array<[number, number]>;
  color?: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: LeafletLatLng) => void }) {
  useMapEvent('click', (e) => onMapClick(e.latlng));
  return null;
}

// Zooming out is only unsafe past the point where the max-bounds box becomes
// smaller than the on-screen map, since Leaflet would then have to fill the
// rest of the viewport with whatever lies just outside the box (the Green
// Line into Israel, in this app's case) - not before. So instead of a fixed
// minZoom that blocks zooming out altogether, compute the tightest zoom that
// still fits the whole box in the current container and allow anything down
// to that, recomputing whenever the map container is resized.
function BoundsMinZoom({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    const applyMinZoom = () => {
      const fitZoom = map.getBoundsZoom(bounds, false);
      map.setMinZoom(fitZoom);
      if (map.getZoom() < fitZoom) {
        map.setZoom(fitZoom);
      }
    };

    applyMinZoom();
    map.on('resize', applyMinZoom);
    window.addEventListener('resize', applyMinZoom);
    return () => {
      map.off('resize', applyMinZoom);
      window.removeEventListener('resize', applyMinZoom);
    };
  }, [map, bounds]);

  return null;
}

interface MapViewProps {
  smartRouting: SmartRoutingPlanState;
  roadHazards: RoadHazardsState;
  isUpdatesOpen: boolean;
  onOpenUpdates: () => void;
}

export function MapView({ smartRouting, roadHazards, isUpdatesOpen, onOpenUpdates }: MapViewProps) {
  // State management for map interactions
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showContainers, setShowContainers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  // null = show every truck's route; otherwise restrict to just these truck ids.
  const [visibleRouteTruckIds, setVisibleRouteTruckIds] = useState<Set<string> | null>(null);
  const [isAddHazardMode, setIsAddHazardMode] = useState(false);
  const [pendingHazardPosition, setPendingHazardPosition] = useState<LatLng | null>(null);

  const { hazards, addHazard, toggleHazardActive, removeHazard } = roadHazards;

  const {
    trucks,
    containers,
    plan,
    roadGeometry,
    landfillRoute,
    isResolvingRoads,
    isRegenerating,
    regenerate,
  } = smartRouting;

  // Depot locations actually used by the current fleet, for the small warehouse markers.
  const depots = useMemo(() => {
    const seen = new Map<string, (typeof trucks)[number]>();
    trucks.forEach((t) => {
      if (!seen.has(t.depotName)) seen.set(t.depotName, t);
    });
    return [...seen.values()];
  }, [trucks]);

  // Truck fleet -> map vehicle markers. Dispatched trucks are placed at their
  // next stop (so the map reads as "who's heading where"); idle/maintenance
  // trucks sit at their depot.
  const vehicles: Vehicle[] = useMemo(
    () =>
      trucks.map((truck) => {
        const routeIndex = plan.routes.findIndex((r) => r.truck.id === truck.id);
        const assignedRoute = routeIndex === -1 ? undefined : plan.routes[routeIndex];
        const routePath = assignedRoute ? roadGeometry[truck.id] : undefined;
        return {
          id: truck.id,
          driver: truck.driver,
          status: assignedRoute ? 'active' : 'inactive',
          route: assignedRoute
            ? `${assignedRoute.stops.length} توقف · ${assignedRoute.totalDistanceKm.toFixed(1)} كم`
            : truck.status === 'maintenance'
              ? 'صيانة'
              : 'لا يوجد مسار اليوم',
          position:
            assignedRoute && routePath
              ? nearestPointOnPath(assignedRoute.stops[0].container.position, routePath)
              : assignedRoute
                ? assignedRoute.stops[0].container.position
                : truck.depot,
          color: assignedRoute ? routeColor(routeIndex, plan.routes.length) : undefined,
        };
      }),
    [trucks, plan.routes, roadGeometry]
  );

  // Smart-routing output -> road-following (or fallback) polylines, one distinct color per truck.
  const routes: Route[] = useMemo(
    () =>
      plan.routes.map((r, i) => ({
        id: r.truck.id,
        type: 'normal' as const,
        points: roadGeometry[r.truck.id] ?? [
          r.truck.depot,
          ...r.stops.map((s) => s.container.position),
          r.truck.depot,
        ],
        color: routeColor(i, plan.routes.length),
      })),
    [plan.routes, roadGeometry]
  );

  // Which routes are actually drawn - all of them by default, or only the
  // ones picked in the route filter dropdown (see RouteVehicleFilter).
  const visibleRoutes = useMemo(
    () => (visibleRouteTruckIds === null ? routes : routes.filter((r) => visibleRouteTruckIds.has(r.id))),
    [routes, visibleRouteTruckIds]
  );

  const handleVehicleClick = (vehicle: Vehicle, event: LeafletMouseEvent) => {
    setTooltipPosition({ x: event.originalEvent.clientX, y: event.originalEvent.clientY });
    setSelectedVehicle(vehicle);
  };

  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  const modificationsToday = PLAN_MODIFICATIONS_TODAY;

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      {/* Map Controls */}
      <MapControls
        showVehicles={showVehicles}
        showRoutes={showRoutes}
        showContainers={showContainers}
        showHeatmap={showHeatmap}
        onToggleVehicles={() => setShowVehicles(!showVehicles)}
        onToggleRoutes={() => setShowRoutes(!showRoutes)}
        onToggleContainers={() => setShowContainers(!showContainers)}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        onOpenUpdates={onOpenUpdates}
        onRegenerateRoutes={regenerate}
        isRegeneratingRoutes={isRegenerating}
        isAddHazardMode={isAddHazardMode}
        onToggleAddHazardMode={() => {
          setIsAddHazardMode((v) => !v);
          setPendingHazardPosition(null);
        }}
        routes={routes}
        visibleRouteTruckIds={visibleRouteTruckIds}
        onVisibleRouteTruckIdsChange={setVisibleRouteTruckIds}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Real Hebron map - Layer 0 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{ zIndex: 0 }}
        >
          <MapContainer
            center={MAP_DEFAULT_VIEW_CENTER}
            zoom={16}
            maxZoom={18}
            maxBounds={MAP_MAX_BOUNDS}
            maxBoundsViscosity={1.0}
            zoomControl={false}
            markerZoomAnimation={false}
            className="absolute inset-0"
            style={{ direction: 'ltr' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            <BoundsMinZoom bounds={MAP_MAX_BOUNDS} />
            <MapClickHandler
              onMapClick={(latlng) => {
                if (isAddHazardMode) {
                  setPendingHazardPosition([latlng.lat, latlng.lng]);
                  return;
                }
                if (!isUpdatesOpen) {
                  setSelectedVehicle(null);
                }
              }}
            />

            {/* The single road out of Hebron - to the Al-Minya landfill. There are no
                containers beyond the city, this is the only reason a truck ever
                leaves it. */}
            <Polyline
              positions={landfillRoute}
              interactive={false}
              pathOptions={{
                color: '#78350f',
                weight: 3,
                dashArray: '10,6',
                opacity: 0.65,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Marker position={LANDFILL_POSITION} icon={landfillIcon}>
              <LeafletTooltip direction="top">{LANDFILL_NAME}</LeafletTooltip>
            </Marker>

            {/* Smart-routing road routes, one color per truck */}
            {showRoutes && <RouteLayer routes={visibleRoutes} />}

            {/* Waste production density, weighted by each container's estimated current volume */}
            {showHeatmap && <HeatmapLayer containers={containers} />}

            {/* Waste containers, colored by fill level */}
            {showContainers &&
              containers.map((container) => (
                <WasteContainerMarker key={container.id} container={container} />
              ))}

            {/* Depot / warehouse markers */}
            {showVehicles &&
              depots.map((depot) => (
                <Marker key={depot.depotName} position={depot.depot} icon={depotIcon}>
                  <LeafletTooltip direction="top">{depot.depotName}</LeafletTooltip>
                </Marker>
              ))}

            {/* Truck Fleet Markers */}
            {showVehicles &&
              vehicles.map((vehicle) => (
                <VehicleMarker
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={(e) => {
                    if (!isUpdatesOpen) {
                      handleVehicleClick(vehicle, e);
                    }
                  }}
                  zIndexOffset={isUpdatesOpen ? -100 : 0}
                />
              ))}

            {/* Dispatcher-marked road closures / traffic jams - the optimizer
                steers assignments away from active ones (see roadHazards.ts). */}
            {hazards.map((hazard) => (
              <RoadHazardMarker
                key={hazard.id}
                hazard={hazard}
                onToggleActive={toggleHazardActive}
                onRemove={removeHazard}
              />
            ))}
          </MapContainer>
        </motion.div>

        {/* Add-hazard form, shown after clicking the map in add-hazard mode */}
        <AnimatePresence>
          {pendingHazardPosition && (
            <AddHazardForm
              position={pendingHazardPosition}
              onSubmit={(input) => {
                addHazard(input);
                setPendingHazardPosition(null);
              }}
              onCancel={() => setPendingHazardPosition(null)}
            />
          )}
        </AnimatePresence>

        {/* Road-routing progress indicator */}
        <AnimatePresence>
          {isResolvingRoads && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm border-2 border-primary/30 text-primary rounded-full px-4 py-2 shadow-lg text-sm font-medium flex items-center gap-2"
              style={{ zIndex: 1000 }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              جارٍ حساب المسارات على شبكة الطرق الفعلية...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Details Panel (Fixed Left) - Layer 1100 */}
        <QuickDetailsPanel
          activeVehicles={activeVehiclesCount}
          modifications={modificationsToday}
        />

        {/* Legend (Bottom-Left, Collapsible) - Layer 1100 */}
        <MapLegend />

        {/* Tooltips - Layer 1200 */}
        {selectedVehicle && !isUpdatesOpen && (
          <VehicleTooltip
            vehicle={selectedVehicle}
            position={tooltipPosition}
            onClose={() => setSelectedVehicle(null)}
            isIsolated={
              visibleRouteTruckIds !== null &&
              visibleRouteTruckIds.size === 1 &&
              visibleRouteTruckIds.has(selectedVehicle.id)
            }
            onToggleIsolate={() => {
              setVisibleRouteTruckIds((current) =>
                current !== null && current.size === 1 && current.has(selectedVehicle.id)
                  ? null
                  : new Set([selectedVehicle.id])
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
