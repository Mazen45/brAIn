import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function ExportOptions() {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: string) => {
    alert(`جاري تحميل التقرير بصيغة ${format}...`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <Download className="w-4 h-4" />
        <span className="font-medium">تحميل التقرير</span>
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
                onClick={() => handleExport('PDF')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-right"
              >
                <FileText className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-semibold text-foreground">تحميل PDF</p>
                  <p className="text-xs text-muted-foreground">ملف قابل للطباعة</p>
                </div>
              </button>

              <div className="border-t border-border" />

              <button
                onClick={() => handleExport('Excel')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-right"
              >
                <FileSpreadsheet className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold text-foreground">تحميل Excel</p>
                  <p className="text-xs text-muted-foreground">ملف قابل للتحليل</p>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
