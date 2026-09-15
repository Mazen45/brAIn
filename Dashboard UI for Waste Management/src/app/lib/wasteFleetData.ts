import { Truck, WasteContainer, WasteType, LatLng } from './wasteRoutingTypes';

// Hebron (الخليل) bounding box, shared with mapGeo.ts's HEBRON_CENTER area,
// used to scatter mock trucks/containers over the real city extent.
//
// Kept tight and west of ~lng 35.108: the Kiryat Arba settlement and its
// Ramat Mamre / Givat HaAvot neighborhoods sit just east of Hebron
// (roughly lng 35.108-35.132, lat 31.53-31.55), and Route 60 runs along
// the same corridor - verified against real OSRM-routed paths so no
// container, depot, or truck route generated inside these bounds ever
// lands in or routes through that area.
const BOUNDS = {
  latMax: 31.545,
  latMin: 31.515,
  lngMin: 35.078,
  lngMax: 35.102,
};

// Small deterministic PRNG (mulberry32) so the demo dataset is stable across
// renders instead of reshuffling every time a component re-mounts.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPoint(random: () => number): LatLng {
  const lat = BOUNDS.latMin + random() * (BOUNDS.latMax - BOUNDS.latMin);
  const lng = BOUNDS.lngMin + random() * (BOUNDS.lngMax - BOUNDS.lngMin);
  return [lat, lng];
}

const DEPOTS: { name: string; position: LatLng }[] = [
  { name: 'مستودع الشمال', position: [31.542, 35.090] },
  { name: 'مستودع الوسط', position: [31.528, 35.096] },
  { name: 'مستودع الجنوب', position: [31.518, 35.092] },
  { name: 'مستودع الشرق', position: [31.530, 35.100] },
];

const DRIVER_NAMES = [
  'أحمد محمد', 'سارة أحمد', 'محمد علي', 'فاطمة حسن', 'خالد يوسف',
  'ليلى إبراهيم', 'عمر سالم', 'ريم ناصر', 'يوسف عيسى', 'هدى كمال',
  'ماجد عودة', 'نور الدين', 'سامية طه', 'بلال حمدان', 'رنا زيدان',
  'وائل صبري', 'ديمة فارس', 'حسام درويش', 'إيمان راشد', 'طارق نمر',
];

const CONTAINER_CAPACITIES = [240, 660, 1100];
const WASTE_TYPES: WasteType[] = ['عام', 'قابل لإعادة التدوير', 'عضوي'];

export const TRUCK_COUNT = 20;
export const CONTAINER_COUNT = 90;
export const MAINTENANCE_TRUCK_COUNT = 3;

export function generateMockTrucks(seed = 1): Truck[] {
  const random = mulberry32(seed);
  return Array.from({ length: TRUCK_COUNT }, (_, i) => {
    const depot = DEPOTS[i % DEPOTS.length];
    const isMaintenance = i >= TRUCK_COUNT - MAINTENANCE_TRUCK_COUNT;
    return {
      id: `T${String(i + 1).padStart(2, '0')}`,
      driver: DRIVER_NAMES[i % DRIVER_NAMES.length],
      depot: depot.position,
      depotName: depot.name,
      capacityL: 6000 + Math.floor(random() * 4) * 1000, // 6000-9000 L
      avgSpeedKmh: 22 + Math.floor(random() * 10), // urban driving + stops
      status: isMaintenance ? 'maintenance' : 'available',
    };
  });
}

export function generateMockContainers(seed = 2): WasteContainer[] {
  const random = mulberry32(seed);
  return Array.from({ length: CONTAINER_COUNT }, (_, i) => {
    // Skew fill levels so a realistic mix of empty/mid/critical containers exists.
    const fillRoll = random();
    const fillLevel = Math.round(
      fillRoll < 0.3 ? random() * 40 : fillRoll < 0.7 ? 40 + random() * 30 : 70 + random() * 30
    );
    return {
      id: `C${String(i + 1).padStart(3, '0')}`,
      name: `حاوية C-${String(i + 1).padStart(3, '0')}`,
      position: randomPoint(random),
      capacityL: CONTAINER_CAPACITIES[Math.floor(random() * CONTAINER_CAPACITIES.length)],
      fillLevel,
      wasteType: WASTE_TYPES[Math.floor(random() * WASTE_TYPES.length)],
      hoursSinceLastCollection: Math.round(4 + random() * 68),
    };
  });
}
