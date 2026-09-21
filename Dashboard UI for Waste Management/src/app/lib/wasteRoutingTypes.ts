export type LatLng = [number, number];

export type WasteType = 'عام' | 'قابل لإعادة التدوير' | 'عضوي';

export interface WasteContainer {
  id: string;
  name: string;
  position: LatLng;
  capacityL: number;
  fillLevel: number; // 0-100
  wasteType: WasteType;
  hoursSinceLastCollection: number;
}

export interface Truck {
  id: string;
  driver: string;
  depot: LatLng;
  depotName: string;
  capacityL: number;
  avgSpeedKmh: number;
  /** Mechanical status of the vehicle itself. */
  status: 'available' | 'maintenance';
  /** Whether this truck's driver is present today - independent of the
   * vehicle's own mechanical status: a driver can be absent while the truck
   * is fine, or vice versa. A truck can only be dispatched when both are true. */
  driverAvailable: boolean;
  /** Dispatcher-entered reason for the current unavailability (driver absence
   * or maintenance), if one was given - see QuickStatusUpdate. */
  unavailabilityReason?: string;
}

export interface RouteStop {
  container: WasteContainer;
  legDistanceKm: number;
  cumulativeDistanceKm: number;
  collectedLiters: number;
}

export interface TruckRoute {
  truck: Truck;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDurationMin: number;
  loadLiters: number;
  loadPercent: number;
}

export interface RoutingMetrics {
  totalTrucks: number;
  /** Trucks that are both mechanically available AND have their driver present today. */
  availableTrucks: number;
  /** Trucks whose driver is absent today, regardless of the vehicle's own mechanical status. */
  driversUnavailable: number;
  /** Trucks under maintenance, regardless of whether their driver is present. */
  vehiclesOutOfService: number;
  trucksUsed: number;
  totalContainers: number;
  dueContainers: number;
  collectedContainers: number;
  totalWasteCollectedLiters: number;
  totalWasteDueLiters: number;
  totalDistanceKm: number;
  avgLoadPercent: number;
  litersPerKm: number;
  naiveDistanceKm: number;
  naiveTrucksUsed: number;
  distanceSavedPercent: number;
  trucksSavedCount: number;
}

export interface RoutingPlanResult {
  routes: TruckRoute[];
  unassignedContainers: WasteContainer[];
  skippedContainers: WasteContainer[];
  metrics: RoutingMetrics;
}
