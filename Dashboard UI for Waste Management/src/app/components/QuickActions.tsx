import { RotateCw, Users, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsProps {
  onNavigate: (item: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions = [
    {
      id: 'regenerate',
      icon: RotateCw,
      label: 'إعادة توليد خطة المسارات',
      description: 'إنشاء مسارات محسّنة جديدة',
      color: 'primary',
      target: 'route',
    },
    {
      id: 'drivers',
      icon: Users,
      label: 'عرض حالة السائقين',
      description: 'التحقق من توفر السائقين',
      color: 'secondary',
      target: 'drivers',
    },
    {
      id: 'alerts',
      icon: AlertCircle,
      label: 'عرض التنبيهات',
      description: 'مراجعة إشعارات النظام',
      color: 'accent',
      target: 'alerts',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-1">إجراءات سريعة</h3>
      <p className="text-sm text-muted-foreground mb-6">العمليات الأكثر استخداماً</p>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => onNavigate(action.target)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 border-2 border-transparent hover:border-primary/30 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">{action.label}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
