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
  status: 'available' | 'maintenance';
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
  availableTrucks: number;
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
