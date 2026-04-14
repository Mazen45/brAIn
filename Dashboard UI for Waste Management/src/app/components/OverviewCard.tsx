import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface OverviewCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  delay?: number;
}

export function OverviewCard({ title, value, icon: Icon, variant = 'default', delay = 0 }: OverviewCardProps) {
  const variantStyles = {
    default: 'bg-card border-border hover:border-primary/30',
    warning: 'bg-warning/5 border-warning/30 hover:border-warning/50',
    danger: 'bg-destructive/5 border-destructive/30 hover:border-destructive/50',
    success: 'bg-success/5 border-success/30 hover:border-success/50',
  };

  const iconVariantStyles = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive',
    success: 'bg-success/10 text-success',
  };

  const valueVariantStyles = {
    default: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
    success: 'text-success',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`
        rounded-xl border-2 p-6 shadow-lg
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${variantStyles[variant]}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-3">{title}</p>
          <p className={`text-4xl font-bold ${valueVariantStyles[variant]}`}>{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconVariantStyles[variant]} transition-transform duration-300 hover:scale-110`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </motion.div>
  );
}
