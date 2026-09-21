import { TrendingDown, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { RoutingMetrics } from '../lib/wasteRoutingTypes';

interface VehicleImpactSectionProps {
  metrics: RoutingMetrics;
}

// Every available truck is dispatched under normal circumstances (see
// planSmartRoutes), so "do we have enough vehicles" is no longer a
// meaningful question - the fleet is always maxed out already. The
// question that can actually go wrong is whether that full fleet has
// enough capacity to collect everything due today.
export function VehicleImpactSection({ metrics }: VehicleImpactSectionProps) {
  const coveragePercent =
    metrics.dueContainers > 0
      ? Math.round((metrics.collectedContainers / metrics.dueContainers) * 100)
      : 100;
  const hasShortage = metrics.collectedContainers < metrics.dueContainers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">تأثير سعة الأسطول</h3>
          <p className="text-sm text-muted-foreground">
            تغطية الحاويات المستحقة بكامل الأسطول المتاح ({metrics.availableTrucks} مركبة)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Due vs Collected */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">الحاويات المستحقة اليوم</span>
            <span className="text-2xl font-bold text-foreground">{metrics.dueContainers}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
            <span className="text-sm font-medium text-success">الحاويات التي تم جمعها</span>
            <span className="text-2xl font-bold text-success">{metrics.collectedContainers}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-primary">نسبة التغطية</span>
            <span className="text-2xl font-bold text-primary">{coveragePercent}%</span>
          </div>
        </div>

        {/* Coverage Bar */}
        <div className="pt-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                coveragePercent >= 80 ? 'bg-success' : coveragePercent >= 60 ? 'bg-warning' : 'bg-destructive'
              }`}
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
            hasShortage
              ? 'bg-warning/5 border-warning/30'
              : 'bg-success/5 border-success/30'
          }`}
        >
          {hasShortage ? (
            <XCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm font-medium ${hasShortage ? 'text-warning' : 'text-success'}`}>
            {hasShortage
              ? 'سعة الأسطول الحالية غير كافية لتغطية كل الحاويات المستحقة اليوم'
              : 'الأسطول المتاح يغطي جميع الحاويات المستحقة اليوم'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
