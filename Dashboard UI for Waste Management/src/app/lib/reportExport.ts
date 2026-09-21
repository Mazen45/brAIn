import {
  DELAY_BY_REASON,
  DRIVER_ABSENCE_BY_DAY,
  MODIFICATION_TYPE_LABELS,
  PLAN_CHANGES_BY_DAY,
  REDISTRIBUTION_STATS,
  modificationsForPeriod,
  type ModificationType,
} from './reportsData';
import { csvRow, downloadTextFile } from './csv';

/** DOM id of the Reports page's content wrapper, captured for the PDF export. */
export const REPORT_CONTENT_ELEMENT_ID = 'reports-page-content';

const PERIOD_LABELS: Record<string, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  quarter: 'هذا الربع',
  year: 'هذا العام',
};

function typeLabel(type: string): string {
  if (type === 'all') return 'جميع التعديلات';
  return MODIFICATION_TYPE_LABELS[type as ModificationType] ?? type;
}

/**
 * Assembles the Reports page's data into a CSV, filtered the same way the
 * on-screen charts are, so the download always matches what's visible.
 */
export function buildReportCsv(selectedPeriod: string, selectedType: string): string {
  const overallAverageDelay = Math.round(
    DELAY_BY_REASON.reduce((sum, r) => sum + r.delay, 0) / DELAY_BY_REASON.length
  );
  const delayRows =
    selectedType === 'all' ? DELAY_BY_REASON : DELAY_BY_REASON.filter((r) => r.type === selectedType);

  const lines: string[] = [
    csvRow(['تقرير أداء النظام - نظام التوجيه الذكي']),
    csvRow(['الفترة', PERIOD_LABELS[selectedPeriod] ?? selectedPeriod]),
    csvRow(['نوع التعديل', typeLabel(selectedType)]),
    '',
    csvRow(['المؤشرات الرئيسية']),
    csvRow(['عدد مرات تعديل الخطة', modificationsForPeriod(selectedPeriod)]),
    csvRow(['نسبة نجاح إعادة التوزيع (%)', REDISTRIBUTION_STATS[0].value]),
    csvRow(['متوسط التأخير (دقيقة)', overallAverageDelay]),
    '',
    csvRow(['تغيرات الخطة حسب اليوم (آخر أسبوع)']),
    csvRow(['اليوم', 'عدد التعديلات']),
    ...PLAN_CHANGES_BY_DAY.map((d) => csvRow([d.day, d.changes])),
    '',
    csvRow(['متوسط التأخير حسب السبب']),
    csvRow(['السبب', 'التأخير (دقيقة)']),
    ...delayRows.map((r) => csvRow([r.reason, r.delay])),
    '',
    csvRow(['نتائج إعادة التوزيع']),
    csvRow(['النتيجة', 'النسبة (%)']),
    ...REDISTRIBUTION_STATS.map((s) => csvRow([s.label, s.value])),
  ];

  if (selectedType === 'all' || selectedType === 'driver') {
    lines.push(
      '',
      csvRow(['تأثير غياب السائقين حسب اليوم']),
      csvRow(['اليوم', 'سائقين غائبين', 'التأخير (دقيقة)']),
      ...DRIVER_ABSENCE_BY_DAY.map((d) => csvRow([d.day, d.absent, d.delay]))
    );
  }

  return lines.join('\r\n');
}

/** Downloads the report as a CSV (opens directly in Excel/Sheets). */
export function downloadReportCsv(selectedPeriod: string, selectedType: string): void {
  const csv = buildReportCsv(selectedPeriod, selectedType);
  downloadTextFile(`تقرير-النظام-${selectedPeriod}.csv`, csv, 'text/csv');
}

/**
 * Renders the given DOM element to a raster image (via html2canvas-pro, which
 * - unlike the original html2canvas - understands the oklch()/color-mix()
 * colors this app's Tailwind v4 theme uses) and paginates it into a PDF.
 * A screenshot-based PDF is used instead of text placement because jsPDF's
 * built-in fonts don't support Arabic glyphs.
 */
export async function downloadReportPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Report content element not found');

  // Loaded on demand - these two libraries are only ever needed once someone
  // actually clicks "Download PDF", so they shouldn't cost every visitor a
  // heavier initial page load.
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/png');

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
