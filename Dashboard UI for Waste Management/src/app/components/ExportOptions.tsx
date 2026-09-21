import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import { downloadReportCsv, downloadReportPdf, REPORT_CONTENT_ELEMENT_ID } from '../lib/reportExport';

interface ExportOptionsProps {
  selectedPeriod: string;
  selectedType: string;
}

export function ExportOptions({ selectedPeriod, selectedType }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { message, showToast } = useToast();

  const handleExportCsv = () => {
    downloadReportCsv(selectedPeriod, selectedType);
    showToast('تم تحميل التقرير بصيغة Excel');
    setIsOpen(false);
  };

  const handleExportPdf = async () => {
    setIsOpen(false);
    setIsExportingPdf(true);
    try {
      await downloadReportPdf(REPORT_CONTENT_ELEMENT_ID, `تقرير-النظام-${selectedPeriod}.pdf`);
      showToast('تم تحميل التقرير بصيغة PDF');
    } catch {
      showToast('تعذّر إنشاء ملف PDF، يرجى المحاولة مرة أخرى');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="relative">
      <Toast message={message} />
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExportingPdf}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <span className="font-medium">{isExportingPdf ? 'جارٍ إنشاء الملف...' : 'تحميل التقرير'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 bg-card border-2 border-border rounded-lg shadow-xl overflow-hidden z-20 min-w-[200px]"
              dir="rtl"
            >
              <button
                onClick={handleExportPdf}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-right"
              >
                <FileText className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-semibold text-foreground">تحميل PDF</p>
                  <p className="text-xs text-muted-foreground">لقطة من صفحة التقارير الحالية</p>
                </div>
              </button>

              <div className="border-t border-border" />

              <button
                onClick={handleExportCsv}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-right"
              >
                <FileSpreadsheet className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold text-foreground">تحميل Excel</p>
                  <p className="text-xs text-muted-foreground">ملف CSV يفتح مباشرة في Excel</p>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
