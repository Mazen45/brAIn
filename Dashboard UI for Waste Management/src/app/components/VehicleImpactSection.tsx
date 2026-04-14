import { TrendingDown, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function VehicleImpactSection() {
  const requiredVehicles = 15;
  const availableVehicles = 11;
  const coveragePercent = Math.round((availableVehicles / requiredVehicles) * 100);
  const hasShortage = availableVehicles < requiredVehicles;

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
          <h3 className="text-lg font-semibold">تأثير نقص المركبات</h3>
          <p className="text-sm text-muted-foreground">تحليل الفجوة بين المطلوب والمتاح</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Required vs Available */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">عدد المركبات المطلوبة</span>
            <span className="text-2xl font-bold text-foreground">{requiredVehicles}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
            <span className="text-sm font-medium text-success">عدد المركبات المتاحة</span>
            <span className="text-2xl font-bold text-success">{availableVehicles}</span>
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
              ? 'يوجد نقص يؤثر على سرعة جمع النفايات'
              : 'التغطية الحالية كافية'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
