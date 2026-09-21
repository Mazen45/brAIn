export type ZoneLevel = 'normal' | 'medium' | 'critical';
export type ZoneResourceStatus = 'sufficient' | 'shortage';

export interface WasteZone {
  id: string;
  name: string;
  level: ZoneLevel;
  resourceStatus: ZoneResourceStatus;
  containersDue: number;
  estimatedDelayMinutes: number;
}

// Illustrative neighborhood-level breakdown backing the Waste Analysis page's
// filters and summary cards, so selecting a level/resource filter actually
// narrows a real list instead of leaving the page unchanged.
export const WASTE_ZONES: WasteZone[] = [
  { id: 'z1', name: 'وسط المدينة', level: 'critical', resourceStatus: 'shortage', containersDue: 18, estimatedDelayMinutes: 50 },
  { id: 'z2', name: 'السوق القديم', level: 'critical', resourceStatus: 'shortage', containersDue: 15, estimatedDelayMinutes: 40 },
  { id: 'z3', name: 'الحي الشرقي', level: 'critical', resourceStatus: 'sufficient', containersDue: 12, estimatedDelayMinutes: 35 },
  { id: 'z4', name: 'حي الجامعة', level: 'medium', resourceStatus: 'shortage', containersDue: 9, estimatedDelayMinutes: 22 },
  { id: 'z5', name: 'الحي الجنوبي', level: 'medium', resourceStatus: 'shortage', containersDue: 8, estimatedDelayMinutes: 20 },
  { id: 'z6', name: 'الحي الشمالي', level: 'medium', resourceStatus: 'sufficient', containersDue: 7, estimatedDelayMinutes: 18 },
  { id: 'z7', name: 'المنطقة الصناعية', level: 'medium', resourceStatus: 'sufficient', containersDue: 6, estimatedDelayMinutes: 15 },
  { id: 'z8', name: 'حي الضاحية', level: 'medium', resourceStatus: 'sufficient', containersDue: 5, estimatedDelayMinutes: 12 },
  { id: 'z9', name: 'الحي الغربي', level: 'normal', resourceStatus: 'sufficient', containersDue: 2, estimatedDelayMinutes: 5 },
  { id: 'z10', name: 'المنطقة الزراعية', level: 'normal', resourceStatus: 'sufficient', containersDue: 1, estimatedDelayMinutes: 3 },
];
