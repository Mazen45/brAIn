import { motion } from 'motion/react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import type { WasteZone } from '../lib/wasteZones';

const levelConfig = {
  critical: { label: 'حرج', icon: AlertCircle, classes: 'bg-destructive/5 border-destructive/30 text-destructive' },
  medium: { label: 'متوسط', icon: Clock, classes: 'bg-warning/5 border-warning/30 text-warning' },
  normal: { label: 'طبيعي', icon: CheckCircle, classes: 'bg-success/5 border-success/30 text-success' },
};

interface ZonesListProps {
  zones: WasteZone[];
  totalCount: number;
}

export function ZonesList({ zones, totalCount }: ZonesListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-1">المناطق المطابقة للتصفية</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {zones.length} من أصل {totalCount} منطقة تطابق الفلتر المحدد
      </p>

      {zones.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">لا توجد مناطق تطابق هذا الفلتر</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone, index) => {
            const config = levelConfig[zone.level];
            const Icon = config.icon;
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className={`p-4 rounded-lg border-2 ${config.classes}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-foreground">{zone.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{config.label}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>حاويات مستحقة</span>
                    <span className="font-semibold text-foreground">{zone.containersDue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التأخير المتوقع</span>
                    <span className="font-semibold text-foreground">{zone.estimatedDelayMinutes} د</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الموارد</span>
                    <span className="font-semibold text-foreground">
                      {zone.resourceStatus === 'shortage' ? 'نقص' : 'كافية'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
