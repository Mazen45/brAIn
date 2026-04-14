import { AlertCircle, Clock, Truck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export function AnalysisSummaryCards() {
  const cards = [
    {
      id: 1,
      title: 'المناطق الحرجة',
      value: 3,
      icon: AlertCircle,
      variant: 'critical' as const,
      delay: 0,
    },
    {
      id: 2,
      title: 'مناطق قد تتأخر',
      value: 5,
      icon: Clock,
      variant: 'warning' as const,
      delay: 0.1,
    },
    {
      id: 3,
      title: 'المركبات المتاحة',
      value: 11,
      icon: Truck,
      variant: 'success' as const,
      delay: 0.2,
    },
    {
      id: 4,
      title: 'نقص في الموارد',
      value: 'نعم',
      icon: AlertTriangle,
      variant: 'warning' as const,
      delay: 0.3,
    },
  ];

  const variantStyles = {
    critical: 'bg-destructive/10 border-destructive/30 text-destructive',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    success: 'bg-success/10 border-success/30 text-success',
  };

  const iconVariantStyles = {
    critical: 'bg-destructive/20 text-destructive',
    warning: 'bg-warning/20 text-warning',
    success: 'bg-success/20 text-success',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay, duration: 0.5 }}
            className={`
              rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1
              ${variantStyles[card.variant]}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2 opacity-90">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconVariantStyles[card.variant]}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
