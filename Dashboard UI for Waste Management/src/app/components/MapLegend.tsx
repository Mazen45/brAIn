import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm border-2 border-border rounded-xl shadow-xl overflow-hidden"
      style={{ zIndex: 10 }}
      dir="rtl"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <h4 className="font-semibold text-sm">دليل الألوان</h4>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Legend Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2.5 border-t border-border"
              style={{ minWidth: '200px' }}
            >
              {/* Zone Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">حالة المناطق:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success border border-success/30"></div>
                    <span className="text-xs">طبيعي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning border border-warning/30"></div>
                    <span className="text-xs">متوسط</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive border border-destructive/30"></div>
                    <span className="text-xs">حرج</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Status */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">حالة المركبات:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-success"></div>
                    <span className="text-xs">نشط</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground"></div>
                    <span className="text-xs">غير متاح</span>
                  </div>
                </div>
              </div>

              {/* Route Types */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">نوع المسارات:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-primary"></div>
                    <span className="text-xs">مسار عادي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-blue-500"></div>
                    <span className="text-xs">مسار محدث</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 border-t-2 border-dashed border-muted-foreground"></div>
                    <span className="text-xs">مسار ملغي</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
