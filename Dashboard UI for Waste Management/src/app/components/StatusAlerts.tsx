import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { RoutingMetrics } from '../lib/wasteRoutingTypes';

interface StatusAlertsProps {
  metrics: RoutingMetrics;
}

export function StatusAlerts({ metrics }: StatusAlertsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-warning/5 border-2 border-warning/30 rounded-xl p-4 shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <p className="text-foreground font-medium">
            تم تسجيل <span className="font-bold text-warning">{metrics.driversUnavailable} سائقين</span> غير متاحين اليوم و{' '}
            <span className="font-bold text-warning">{metrics.vehiclesOutOfService} مركبات</span> خارج الخدمة
          </p>
        </div>
      </div>
    </motion.div>
  );
}
