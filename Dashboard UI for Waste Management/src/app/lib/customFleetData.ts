import { Truck, WasteContainer, WasteType } from './wasteRoutingTypes';
import { csvRow, csvRowsToRecords, parseCsv } from './csv';

export interface CustomDepot {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface CustomTruck {
  id: string;
  driver: string;
  depotId: string;
  capacityL: number;
  avgSpeedKmh: number;
  /** Mechanical status of the vehicle itself. */
  status: 'available' | 'maintenance';
  /** Whether this truck's driver is present today - independent of the vehicle's own status. */
  driverAvailable: boolean;
}

export interface CustomContainer {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacityL: number;
  fillLevel: number;
  wasteType: WasteType;
  hoursSinceLastCollection: number;
}

const WASTE_TYPES: WasteType[] = ['عام', 'قابل لإعادة التدوير', 'عضوي'];

// ---------------------------------------------------------------------------
// Conversion to the app's real Truck[]/WasteContainer[] shape, so every page
// downstream (map, route plan, drivers & vehicles, reports) works exactly
// the same way whether the data came from the mock generator or was entered
// by the municipality - see useSmartRoutingPlan.
// ---------------------------------------------------------------------------

export function customTrucksToTrucks(trucks: CustomTruck[], depots: CustomDepot[]): Truck[] {
  const depotById = new Map(depots.map((d) => [d.id, d]));
  return trucks.map((t) => {
    const depot = depotById.get(t.depotId);
    return {
      id: t.id,
      driver: t.driver,
      depot: depot ? ([depot.lat, depot.lng] as [number, number]) : ([0, 0] as [number, number]),
      depotName: depot?.name ?? 'مستودع غير محدد',
      capacityL: t.capacityL,
      avgSpeedKmh: t.avgSpeedKmh,
      status: t.status,
      // Defensive default: data saved to localStorage before this field
      // existed has no driverAvailable key at all, and JSON loaded from
      // storage bypasses type-checking - without this, every truck saved
      // before today would silently look driver-absent and vanish from routing.
      driverAvailable: t.driverAvailable ?? true,
    };
  });
}

export function customContainersToContainers(containers: CustomContainer[]): WasteContainer[] {
  return containers.map((c) => ({
    id: c.id,
    name: c.name,
    position: [c.lat, c.lng] as [number, number],
    capacityL: c.capacityL,
    fillLevel: c.fillLevel,
    wasteType: c.wasteType,
    hoursSinceLastCollection: c.hoursSinceLastCollection,
  }));
}

// ---------------------------------------------------------------------------
// CSV templates - what a municipality's staff downloads, fills in (in Excel
// or any spreadsheet tool), and re-uploads.
// ---------------------------------------------------------------------------

export const DEPOT_CSV_TEMPLATE = [
  csvRow(['id', 'name', 'lat', 'lng']),
  csvRow(['D1', 'مستودع الشمال', '31.542', '35.090']),
].join('\r\n');

export const TRUCK_CSV_TEMPLATE = [
  csvRow(['id', 'driver', 'depotId', 'capacityL', 'avgSpeedKmh', 'status', 'driverAvailable']),
  csvRow(['T01', 'أحمد محمد', 'D1', '7000', '25', 'available', 'yes']),
].join('\r\n');

export const CONTAINER_CSV_TEMPLATE = [
  csvRow(['id', 'name', 'lat', 'lng', 'capacityL', 'fillLevel', 'wasteType', 'hoursSinceLastCollection']),
  csvRow(['C001', 'حاوية شارع الملك', '31.530', '35.095', '1100', '72', 'عام', '10']),
].join('\r\n');

export interface CsvParseResult<T> {
  items: T[];
  errors: string[];
}

function numberOrNaN(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return NaN;
  return Number(value);
}

export function parseDepotsCsv(text: string): CsvParseResult<CustomDepot> {
  const records = csvRowsToRecords(parseCsv(text));
  const items: CustomDepot[] = [];
  const errors: string[] = [];

  records.forEach((r, i) => {
    const name = r['name'];
    const lat = numberOrNaN(r['lat'] ?? r['latitude']);
    const lng = numberOrNaN(r['lng'] ?? r['lon'] ?? r['longitude']);
    if (!name || Number.isNaN(lat) || Number.isNaN(lng)) {
      errors.push(`السطر ${i + 2}: بيانات ناقصة أو غير صالحة (name/lat/lng)`);
      return;
    }
    items.push({ id: r['id'] || `D${i + 1}`, name, lat, lng });
  });

  return { items, errors };
}

export function parseTrucksCsv(text: string, depots: CustomDepot[]): CsvParseResult<CustomTruck> {
  const records = csvRowsToRecords(parseCsv(text));
  const depotIds = new Set(depots.map((d) => d.id));
  const items: CustomTruck[] = [];
  const errors: string[] = [];

  records.forEach((r, i) => {
    const driver = r['driver'];
    const depotId = r['depotid'] ?? r['depot_id'] ?? r['depot'];
    const capacityL = numberOrNaN(r['capacityl'] ?? r['capacity']);
    const avgSpeedKmh = numberOrNaN(r['avgspeedkmh'] ?? r['speed']);
    const status = (r['status'] || 'available').toLowerCase();
    const driverAvailableRaw = (r['driveravailable'] ?? r['driver_available'] ?? 'yes').toLowerCase();

    if (!driver || !depotId || !depotIds.has(depotId) || Number.isNaN(capacityL)) {
      errors.push(`السطر ${i + 2}: بيانات ناقصة أو مستودع غير معروف (${depotId || '-'})`);
      return;
    }

    items.push({
      id: r['id'] || `T${String(i + 1).padStart(2, '0')}`,
      driver,
      depotId,
      capacityL,
      avgSpeedKmh: Number.isNaN(avgSpeedKmh) ? 25 : avgSpeedKmh,
      status: status === 'maintenance' ? 'maintenance' : 'available',
      driverAvailable: !['no', 'false', '0'].includes(driverAvailableRaw),
    });
  });

  return { items, errors };
}

export function parseContainersCsv(text: string): CsvParseResult<CustomContainer> {
  const records = csvRowsToRecords(parseCsv(text));
  const items: CustomContainer[] = [];
  const errors: string[] = [];

  records.forEach((r, i) => {
    const name = r['name'];
    const lat = numberOrNaN(r['lat'] ?? r['latitude']);
    const lng = numberOrNaN(r['lng'] ?? r['lon'] ?? r['longitude']);
    const capacityL = numberOrNaN(r['capacityl'] ?? r['capacity']);
    const fillLevel = numberOrNaN(r['filllevel'] ?? r['fill'] ?? r['fill_level']);
    const wasteTypeRaw = r['wastetype'] ?? r['waste_type'] ?? r['type'];
    const hours = numberOrNaN(r['hourssincelastcollection'] ?? r['hours']);

    if (!name || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(capacityL) || Number.isNaN(fillLevel)) {
      errors.push(`السطر ${i + 2}: بيانات ناقصة أو غير صالحة`);
      return;
    }

    items.push({
      id: r['id'] || `C${String(i + 1).padStart(3, '0')}`,
      name,
      lat,
      lng,
      capacityL,
      fillLevel: Math.min(100, Math.max(0, fillLevel)),
      wasteType: WASTE_TYPES.includes(wasteTypeRaw as WasteType) ? (wasteTypeRaw as WasteType) : 'عام',
      hoursSinceLastCollection: Number.isNaN(hours) ? 0 : hours,
    });
  });

  return { items, errors };
}

export function depotsToCsv(depots: CustomDepot[]): string {
  return [
    csvRow(['id', 'name', 'lat', 'lng']),
    ...depots.map((d) => csvRow([d.id, d.name, d.lat, d.lng])),
  ].join('\r\n');
}

export function trucksToCsv(trucks: CustomTruck[]): string {
  return [
    csvRow(['id', 'driver', 'depotId', 'capacityL', 'avgSpeedKmh', 'status', 'driverAvailable']),
    ...trucks.map((t) =>
      csvRow([t.id, t.driver, t.depotId, t.capacityL, t.avgSpeedKmh, t.status, t.driverAvailable ? 'yes' : 'no'])
    ),
  ].join('\r\n');
}

export function containersToCsv(containers: CustomContainer[]): string {
  return [
    csvRow(['id', 'name', 'lat', 'lng', 'capacityL', 'fillLevel', 'wasteType', 'hoursSinceLastCollection']),
    ...containers.map((c) =>
      csvRow([c.id, c.name, c.lat, c.lng, c.capacityL, c.fillLevel, c.wasteType, c.hoursSinceLastCollection])
    ),
  ].join('\r\n');
}
