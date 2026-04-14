import { AlertTriangle, Clock, WrenchIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function ChangeReasons() {
  const reasons = [
    {
      id: 1,
      reason: 'السائق محمد علي غير متاح',
      type: 'driver' as const,
      icon: AlertTriangle,
      severity: 'critical' as const,
    },
    {
      id: 2,
      reason: 'المركبة رقم 3 خارج الخدمة',
      type: 'vehicle' as const,
      icon: WrenchIcon,
      severity: 'critical' as const,
    },
    {
      id: 3,
      reason: 'تأخر في تنفيذ المسار السابق',
      type: 'delay' as const,
      icon: Clock,
      severity: 'warning' as const,
    },
  ];

  const severityStyles = {
    critical: {
      bg: 'bg-destructive/5',
      border: 'border-destructive/30',
      text: 'text-destructive',
      iconBg: 'bg-destructive/20',
    },
    warning: {
      bg: 'bg-warning/5',
      border: 'border-warning/30',
      text: 'text-warning',
      iconBg: 'bg-warning/20',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4">أسباب التعديل</h3>
      <p className="text-sm text-muted-foreground mb-6">
        الأسباب التي أدت إلى تعديل الخطة الأصلية
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reasons.map((item, index) => {
          const Icon = item.icon;
          const styles = severityStyles[item.severity];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                  <Icon className={`w-5 h-5 ${styles.text}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${styles.text}`}>{item.reason}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
