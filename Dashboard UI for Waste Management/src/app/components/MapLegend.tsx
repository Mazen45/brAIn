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
      style={{ zIndex: 1100 }}
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
              {/* Vehicle Status */}
              <div>
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

              {/* Container fill level */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">امتلاء الحاويات:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#dc2626' }}></div>
                    <span className="text-xs">خطر فيضان (90%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></div>
                    <span className="text-xs">مستحقة الجمع (60%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }}></div>
                    <span className="text-xs">لم تستحق بعد</span>
                  </div>
                </div>
              </div>

              {/* Route colors */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">المسارات المحسّنة:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  كل لون خط يمثل مسار مركبة مختلفة، محسوب على شبكة الطرق الفعلية ومرتّب لأقصر مسافة ممكنة.
                </p>
              </div>

              {/* Landfill road */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-0"
                    style={{ borderTop: '2px dashed #78350f' }}
                  ></div>
                  <span className="text-xs">🗑️ الطريق إلى مكب المنية</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  الطريق الوحيد خارج مدينة الخليل - لا توجد حاويات أو مناطق خدمة خارج المدينة.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
