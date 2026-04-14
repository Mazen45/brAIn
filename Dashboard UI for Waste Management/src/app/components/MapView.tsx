import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapLegend } from './MapLegend';
import { QuickDetailsPanel } from './QuickDetailsPanel';
import { UpdatesBottomSheet } from './UpdatesBottomSheet';
import { MapZone } from './MapZone';
import { VehicleMarker } from './VehicleMarker';
import { RouteLayer } from './RouteLayer';
import { MapControls } from './MapControls';
import { ZoneTooltip } from './ZoneTooltip';
import { VehicleTooltip } from './VehicleTooltip';

export interface Zone {
  id: string;
  name: string;
  status: 'normal' | 'attention' | 'critical';
  level: string;
  reports: number;
  position: { x: number; y: number; width: number; height: number };
  redistributed?: boolean;
  fromVehicle?: string;
  toVehicle?: string;
}

export interface Vehicle {
  id: string;
  driver: string;
  status: 'active' | 'inactive';
  route: string;
  position: { x: number; y: number };
}

export interface Route {
  id: string;
  type: 'normal' | 'modified' | 'cancelled';
  points: Array<{ x: number; y: number }>;
}

export function MapView() {
  // State management for map interactions
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showZones, setShowZones] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  const zones: Zone[] = [
    {
      id: 'z1',
      name: 'المنطقة الشمالية',
      status: 'normal',
      level: 'منخفض',
      reports: 2,
      position: { x: 10, y: 10, width: 35, height: 30 },
    },
    {
      id: 'z2',
      name: 'المنطقة الوسطى',
      status: 'attention',
      level: 'متوسط',
      reports: 5,
      position: { x: 10, y: 45, width: 35, height: 30 },
    },
    {
      id: 'z3',
      name: 'المنطقة الجنوبية',
      status: 'critical',
      level: 'عالي',
      reports: 12,
      position: { x: 10, y: 80, width: 35, height: 15 },
      redistributed: true,
      fromVehicle: 'مركبة 3',
      toVehicle: 'مركبة 1',
    },
    {
      id: 'z4',
      name: 'المنطقة الشرقية',
      status: 'normal',
      level: 'منخفض',
      reports: 1,
      position: { x: 50, y: 10, width: 40, height: 40 },
    },
    {
      id: 'z5',
      name: 'المنطقة الغربية',
      status: 'attention',
      level: 'متوسط',
      reports: 7,
      position: { x: 50, y: 55, width: 40, height: 40 },
    },
  ];

  const vehicles: Vehicle[] = [
    { id: 'v1', driver: 'أحمد محمد', status: 'active', route: 'مسار 1', position: { x: 25, y: 25 } },
    { id: 'v2', driver: 'سارة أحمد', status: 'active', route: 'مسار 2', position: { x: 70, y: 30 } },
    { id: 'v3', driver: 'محمد علي', status: 'inactive', route: 'مسار 3', position: { x: 30, y: 85 } },
    { id: 'v4', driver: 'فاطمة حسن', status: 'active', route: 'مسار 4', position: { x: 65, y: 75 } },
  ];

  const routes: Route[] = [
    {
      id: 'r1',
      type: 'normal',
      points: [
        { x: 25, y: 25 },
        { x: 30, y: 35 },
        { x: 28, y: 50 },
      ],
    },
    {
      id: 'r2',
      type: 'modified',
      points: [
        { x: 70, y: 30 },
        { x: 75, y: 45 },
        { x: 70, y: 60 },
      ],
    },
    {
      id: 'r3',
      type: 'cancelled',
      points: [
        { x: 30, y: 85 },
        { x: 35, y: 90 },
      ],
    },
  ];

  const handleZoneClick = (zone: Zone, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setSelectedZone(zone);
    setSelectedVehicle(null);
  };

  const handleVehicleClick = (vehicle: Vehicle, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setSelectedVehicle(vehicle);
    setSelectedZone(null);
  };

  const criticalZones = zones.filter(z => z.status === 'critical').length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  const modificationsToday = 2;

  return (
    <div className="h-full flex flex-col bg-background" dir="rtl">
      {/* Map Controls */}
      <MapControls
        showZones={showZones}
        showVehicles={showVehicles}
        showRoutes={showRoutes}
        onToggleZones={() => setShowZones(!showZones)}
        onToggleVehicles={() => setShowVehicles(!showVehicles)}
        onToggleRoutes={() => setShowRoutes(!showRoutes)}
        onOpenUpdates={() => setIsUpdatesOpen(true)}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Background - Layer 0 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{ zIndex: 0 }}
          onClick={() => {
            if (!isUpdatesOpen) {
              setSelectedZone(null);
              setSelectedVehicle(null);
            }
          }}
        >
          {/* Google Maps Style Background */}
          <div className="absolute inset-0 bg-[#e5e3df]">
            {/* Streets Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #c9c6c0 2px, transparent 2px),
                  linear-gradient(to bottom, #c9c6c0 2px, transparent 2px),
                  linear-gradient(45deg, #d4d2cd 1px, transparent 1px)
                `,
                backgroundSize: '120px 120px, 120px 120px, 60px 60px',
              }}
            />

            {/* Hebron City Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-gray-300/40 pointer-events-none select-none">
              الخليل
            </div>
          </div>

          {/* SVG Container for Map Elements - Layer 1 */}
          <svg className="absolute inset-0 w-full h-full" style={{ direction: 'ltr', zIndex: 1 }}>
            {/* Routes Layer */}
            {showRoutes && <RouteLayer routes={routes} />}

            {/* Zones Layer */}
            {showZones &&
              zones.map((zone) => (
                <MapZone
                  key={zone.id}
                  zone={zone}
                  onClick={(e) => {
                    if (!isUpdatesOpen) {
                      e.stopPropagation();
                      handleZoneClick(zone, e as any);
                    }
                  }}
                />
              ))}
          </svg>

          {/* Vehicle Markers - Layer 2 */}
          {showVehicles &&
            vehicles.map((vehicle) => (
              <VehicleMarker
                key={vehicle.id}
                vehicle={vehicle}
                onClick={(e) => {
                  if (!isUpdatesOpen) {
                    e.stopPropagation();
                    handleVehicleClick(vehicle, e);
                  }
                }}
                style={{ zIndex: isUpdatesOpen ? 1 : 2 }}
              />
            ))}
        </motion.div>

        {/* Dim Overlay when bottom sheet is open - Layer 40 */}
        <AnimatePresence>
          {isUpdatesOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              style={{ zIndex: 40 }}
              onClick={() => setIsUpdatesOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Quick Details Panel (Fixed Left) - Layer 10 */}
        <QuickDetailsPanel
          criticalZones={criticalZones}
          activeVehicles={activeVehiclesCount}
          modifications={modificationsToday}
        />

        {/* Legend (Bottom-Left, Collapsible) - Layer 10 */}
        <MapLegend />

        {/* Tooltips - Layer 30 */}
        {selectedZone && !isUpdatesOpen && (
          <ZoneTooltip
            zone={selectedZone}
            position={tooltipPosition}
            onClose={() => setSelectedZone(null)}
          />
        )}

        {selectedVehicle && !isUpdatesOpen && (
          <VehicleTooltip
            vehicle={selectedVehicle}
            position={tooltipPosition}
            onClose={() => setSelectedVehicle(null)}
          />
        )}

        {/* Updates Bottom Sheet - Layer 50 */}
        <UpdatesBottomSheet
          isOpen={isUpdatesOpen}
          onClose={() => setIsUpdatesOpen(false)}
        />
      </div>
    </div>
  );
}
