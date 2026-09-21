export interface DayChanges {
  day: string;
  changes: number;
}

// Single source for "plan changes this week" - both the trend chart and the
// headline stat derive from this so they can't quote two different totals
// for the same week again.
export const PLAN_CHANGES_BY_DAY: DayChanges[] = [
  { day: 'السبت', changes: 3 },
  { day: 'الأحد', changes: 2 },
  { day: 'الإثنين', changes: 5 },
  { day: 'الثلاثاء', changes: 4 },
  { day: 'الأربعاء', changes: 6 },
  { day: 'الخميس', changes: 3 },
  { day: 'الجمعة', changes: 2 },
];

const WEEK_TOTAL = PLAN_CHANGES_BY_DAY.reduce((sum, d) => sum + d.changes, 0);

// Scales the weekly modification count to the selected reporting period.
// Rate-based metrics (success %, average delay) intentionally don't scale
// with period length - only counts do.
export function modificationsForPeriod(period: string): number {
  const multiplier: Record<string, number> = {
    today: 1 / 7,
    week: 1,
    month: 30 / 7,
    quarter: 90 / 7,
    year: 365 / 7,
  };
  return Math.max(1, Math.round(WEEK_TOTAL * (multiplier[period] ?? 1)));
}

export type ModificationType = 'driver' | 'vehicle' | 'redistribution' | 'delay';

export const MODIFICATION_TYPE_LABELS: Record<ModificationType, string> = {
  driver: 'غياب سائق',
  vehicle: 'عطل مركبة',
  delay: 'تأخر سابق',
  redistribution: 'إعادة توزيع',
};

export interface DelayByReason {
  reason: string;
  type: ModificationType;
  delay: number;
}

// Shared with the CSV export, so the downloaded file always matches what's
// rendered on screen instead of a separately-maintained copy.
export const DELAY_BY_REASON: DelayByReason[] = [
  { reason: MODIFICATION_TYPE_LABELS.driver, type: 'driver', delay: 20 },
  { reason: MODIFICATION_TYPE_LABELS.vehicle, type: 'vehicle', delay: 25 },
  { reason: MODIFICATION_TYPE_LABELS.delay, type: 'delay', delay: 15 },
  { reason: MODIFICATION_TYPE_LABELS.redistribution, type: 'redistribution', delay: 10 },
];

export interface DriverAbsenceDay {
  day: string;
  absent: number;
  delay: number;
}

export const DRIVER_ABSENCE_BY_DAY: DriverAbsenceDay[] = [
  { day: 'السبت', absent: 2, delay: 8 },
  { day: 'الأحد', absent: 1, delay: 5 },
  { day: 'الإثنين', absent: 4, delay: 18 },
  { day: 'الثلاثاء', absent: 3, delay: 12 },
  { day: 'الأربعاء', absent: 4, delay: 20 },
  { day: 'الخميس', absent: 2, delay: 10 },
  { day: 'الجمعة', absent: 1, delay: 6 },
];

export interface RedistributionStat {
  label: string;
  value: number;
}

export const REDISTRIBUTION_STATS: RedistributionStat[] = [
  { label: 'تم بنجاح', value: 85 },
  { label: 'تسبب بتأخير', value: 10 },
  { label: 'فشل', value: 5 },
];
