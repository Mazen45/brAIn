import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function RedistributionSuccess() {
  const successRate = 85;
  const stats = [
    { label: 'تم بنجاح', value: 85, color: 'success', icon: CheckCircle },
    { label: 'تسبب بتأخير', value: 10, color: 'warning', icon: Clock },
    { label: 'فشل', value: 5, color: 'destructive', icon: XCircle },
  ];

  const colorClasses = {
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  const borderColors = {
    success: 'border-success/30',
    warning: 'border-warning/30',
    destructive: 'border-destructive/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">نسبة نجاح إعادة التوزيع</h3>
          <p className="text-sm text-muted-foreground">تحليل نتائج عمليات إعادة التوزيع</p>
        </div>
      </div>

      {/* Main Success Rate */}
      <div className="mb-6">
        <div className="flex items-end justify-center gap-2 mb-3">
          <span className="text-5xl font-bold text-success">{successRate}</span>
          <span className="text-2xl font-semibold text-success mb-2">%</span>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-4">نسبة نجاح إعادة التوزيع</p>

        {/* Progress Bar */}
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute inset-y-0 right-0 bg-success rounded-full"
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                stat.color === 'success'
                  ? 'bg-success/5 border-success/20'
                  : stat.color === 'warning'
                  ? 'bg-warning/5 border-warning/20'
                  : 'bg-destructive/5 border-destructive/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    stat.color === 'success'
                      ? 'text-success'
                      : stat.color === 'warning'
                      ? 'text-warning'
                      : 'text-destructive'
                  }`}
                />
                <span className="font-medium text-foreground">{stat.label}</span>
              </div>
              <span
                className={`text-lg font-bold ${
                  stat.color === 'success'
                    ? 'text-success'
                    : stat.color === 'warning'
                    ? 'text-warning'
                    : 'text-destructive'
                }`}
              >
                {stat.value}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
