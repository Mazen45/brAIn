import { motion } from 'motion/react';
import { AlertCircle, Bell, CheckCircle, Info, TriangleAlert } from 'lucide-react';
import { StatusAlerts } from './StatusAlerts';
import { ChangeReasons } from './ChangeReasons';
import { SYSTEM_UPDATES, type SystemUpdate } from './UpdatesBottomSheet';
import type { RoutingMetrics } from '../lib/wasteRoutingTypes';

const typeConfig: Record<SystemUpdate['type'], { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'bg-muted/50 border-border text-foreground' },
  warning: { icon: TriangleAlert, classes: 'bg-warning/5 border-warning/20 text-warning' },
  success: { icon: CheckCircle, classes: 'bg-success/5 border-success/20 text-success' },
  alert: { icon: AlertCircle, classes: 'bg-destructive/5 border-destructive/20 text-destructive' },
};

interface AlertsPageProps {
  metrics: RoutingMetrics;
}

export function AlertsPage({ metrics }: AlertsPageProps) {
  return (
    <div className="flex-1 overflow-auto" dir="rtl">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">التنبيهات</h1>
          <p className="text-muted-foreground">جميع تنبيهات النظام وأحداث خطة التوزيع في مكان واحد</p>
        </motion.div>

        {/* Driver/vehicle status alert - same numbers shown on the Drivers & Vehicles page */}
        <StatusAlerts metrics={metrics} />

        {/* Why the plan changed today */}
        <ChangeReasons />

        {/* Full event feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">سجل الأحداث</h3>
              <p className="text-sm text-muted-foreground">جميع الإشعارات الأخيرة المتعلقة بالمركبات والمسارات</p>
            </div>
          </div>

          <div className="space-y-3">
            {SYSTEM_UPDATES.map((update, index) => {
              const { icon: Icon, classes } = typeConfig[update.type];
              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 ${classes}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{update.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
