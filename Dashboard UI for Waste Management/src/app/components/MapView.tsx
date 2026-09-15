import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { LeafletMouseEvent } from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
  ZoomControl,
  useMapEvent,
} from 'react-leaflet';
import { MapLegend } from './MapLegend';
import { QuickDetailsPanel } from './QuickDetailsPanel';
import { UpdatesBottomSheet } from './UpdatesBottomSheet';
import { VehicleMarker } from './VehicleMarker';
import { RouteLayer } from './RouteLayer';
import { MapControls } from './MapControls';
import { VehicleTooltip } from './VehicleTooltip';
import { WasteContainerMarker } from './WasteContainerMarker';
import { HEBRON_CENTER, LANDFILL_NAME, LANDFILL_POSITION, MAP_MAX_BOUNDS } from './mapGeo';
import { useSmartRoutingPlan } from '../hooks/useSmartRoutingPlan';
import { routeColor } from '../lib/routeColors';
import { depotIcon, landfillIcon } from '../lib/mapIcons';

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

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvent('click', onMapClick);
  return null;
}

export function MapView() {
  // State management for map interactions
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showContainers, setShowContainers] = useState(true);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  const {
    trucks,
    containers,
    plan,
    roadGeometry,
    landfillRoute,
    isResolvingRoads,
    isRegenerating,
    regenerate,
  } = useSmartRoutingPlan();

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
        return {
          id: truck.id,
          driver: truck.driver,
          status: assignedRoute ? 'active' : 'inactive',
          route: assignedRoute
            ? `${assignedRoute.stops.length} توقف · ${assignedRoute.totalDistanceKm.toFixed(1)} كم`
            : truck.status === 'maintenance'
              ? 'صيانة'
              : 'لا يوجد مسار اليوم',
          position: assignedRoute ? assignedRoute.stops[0].container.position : truck.depot,
          color: assignedRoute ? routeColor(routeIndex, plan.routes.length) : undefined,
        };
      }),
    [trucks, plan.routes]
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

  const handleVehicleClick = (vehicle: Vehicle, event: LeafletMouseEvent) => {
    setTooltipPosition({ x: event.originalEvent.clientX, y: event.originalEvent.clientY });
    setSelectedVehicle(vehicle);
  };

  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  const modificationsToday = 2;

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      {/* Map Controls */}
      <MapControls
        showVehicles={showVehicles}
        showRoutes={showRoutes}
        showContainers={showContainers}
        onToggleVehicles={() => setShowVehicles(!showVehicles)}
        onToggleRoutes={() => setShowRoutes(!showRoutes)}
        onToggleContainers={() => setShowContainers(!showContainers)}
        onOpenUpdates={() => setIsUpdatesOpen(true)}
        onRegenerateRoutes={regenerate}
        isRegeneratingRoutes={isRegenerating}
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
            center={HEBRON_CENTER}
            zoom={13}
            minZoom={13}
            maxZoom={18}
            maxBounds={MAP_MAX_BOUNDS}
            maxBoundsViscosity={1.0}
            zoomControl={false}
            className="absolute inset-0"
            style={{ direction: 'ltr' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />
            <MapClickHandler
              onMapClick={() => {
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
            {showRoutes && <RouteLayer routes={routes} />}

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
          </MapContainer>
        </motion.div>

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

        {/* Dim Overlay when bottom sheet is open - Layer 1300 */}
        <AnimatePresence>
          {isUpdatesOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              style={{ zIndex: 1300 }}
              onClick={() => setIsUpdatesOpen(false)}
            />
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
          />
        )}

        {/* Updates Bottom Sheet - Layer 1400 */}
        <UpdatesBottomSheet
          isOpen={isUpdatesOpen}
          onClose={() => setIsUpdatesOpen(false)}
        />
      </div>
    </div>
  );
}
