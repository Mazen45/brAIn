export const HEBRON_CENTER: [number, number] = [31.5326, 35.0998];

// There are no waste containers or collection zones outside Hebron city -
// the Al-Minya sanitary landfill (مكب المنية), near Al-Maniya village in
// Bethlehem governorate, is the single destination trucks ever drive to
// outside the city, to dump collected waste. Approximate location (real
// facility coordinates aren't published; this sits at the village the
// landfill serves, ~15km north-east of Hebron).
export const LANDFILL_NAME = 'مكب المنية الصحي';
export const LANDFILL_POSITION: [number, number] = [31.628, 35.216];

// Pan/zoom is locked to this box so the map can never be dragged or zoomed
// out far enough to reveal areas outside the Palestinian territories (e.g.
// across the Green Line into Israel). Sized to comfortably fit Hebron city
// plus the single road out to the Al-Minya landfill, while staying well
// clear of the Green Line to the west.
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [31.42, 34.98], // south-west
  [31.66, 35.25], // north-east
];
