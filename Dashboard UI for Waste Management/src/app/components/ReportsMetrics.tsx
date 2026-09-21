import { RefreshCw, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { modificationsForPeriod, DELAY_BY_REASON, REDISTRIBUTION_STATS } from '../lib/reportsData';

interface ReportsMetricsProps {
  selectedPeriod: string;
}

const overallAverageDelay = Math.round(
  DELAY_BY_REASON.reduce((sum, r) => sum + r.delay, 0) / DELAY_BY_REASON.length
);

export function ReportsMetrics({ selectedPeriod }: ReportsMetricsProps) {
  const metrics = [
    {
      id: 1,
      title: 'عدد مرات تعديل الخطة',
      value: String(modificationsForPeriod(selectedPeriod)),
      suffix: 'تعديل',
      icon: RefreshCw,
      color: 'primary' as const,
      delay: 0,
    },
    {
      id: 2,
      title: 'نسبة نجاح إعادة التوزيع',
      value: String(REDISTRIBUTION_STATS[0].value),
      suffix: '%',
      icon: TrendingUp,
      color: 'success' as const,
      delay: 0.1,
    },
    {
      id: 3,
      title: 'متوسط التأخير',
      value: String(overallAverageDelay),
      suffix: 'دقيقة',
      icon: Clock,
      color: 'warning' as const,
      delay: 0.2,
    },
    {
      id: 4,
      title: 'تأثير غياب السائقين',
      value: 'متوسط',
      suffix: 'على الأداء',
      icon: AlertTriangle,
      color: 'warning' as const,
      delay: 0.3,
    },
  ];

  const colorStyles = {
    primary: 'bg-primary/10 border-primary/30 text-primary',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
  };

  const iconColorStyles = {
    primary: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: metric.delay, duration: 0.5 }}
            className={`rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${colorStyles[metric.color]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2 opacity-90">{metric.title}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorStyles[metric.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold">{metric.value}</span>
              <span className="text-sm font-medium mr-1 opacity-80">{metric.suffix}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
