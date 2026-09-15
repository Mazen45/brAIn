import { Truck, CheckCircle, WrenchIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export function VehicleOverview() {
  const vehicles = [
    {
      id: 1,
      number: 'مركبة 1',
      driver: 'أحمد محمد',
      status: 'operational' as const,
    },
    {
      id: 2,
      number: 'مركبة 2',
      driver: 'سارة أحمد',
      status: 'operational' as const,
    },
    {
      id: 3,
      number: 'مركبة 3',
      driver: '-',
      status: 'out-of-service' as const,
    },
    {
      id: 4,
      number: 'مركبة 4',
      driver: 'فاطمة حسن',
      status: 'operational' as const,
    },
    {
      id: 5,
      number: 'مركبة 5',
      driver: 'خالد يوسف',
      status: 'operational' as const,
    },
    {
      id: 6,
      number: 'مركبة 6',
      driver: '-',
      status: 'maintenance' as const,
    },
  ];

  const statusConfig = {
    operational: {
      label: 'تعمل',
      icon: CheckCircle,
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      iconBg: 'bg-success/20',
    },
    'out-of-service': {
      label: 'خارج الخدمة',
      icon: AlertTriangle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      text: 'text-destructive',
      iconBg: 'bg-destructive/20',
    },
    maintenance: {
      label: 'قيد الصيانة',
      icon: WrenchIcon,
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning',
      iconBg: 'bg-warning/20',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4">حالة المركبات</h3>
      <p className="text-sm text-muted-foreground mb-6">نظرة شاملة على جميع المركبات وحالتها الحالية</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle, index) => {
          const config = statusConfig[vehicle.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              className={`p-4 rounded-lg border-2 ${config.bg} ${config.border} transition-all duration-200 hover:shadow-md`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                    <Truck className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{vehicle.number}</h4>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
                  <StatusIcon className={`w-3 h-3 ${config.text}`} />
                  <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">السائق المرتبط:</span>
                  <span className="text-sm font-medium text-foreground">{vehicle.driver}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-sm text-muted-foreground">إجمالي المركبات: </span>
            <span className="font-bold text-foreground">{vehicles.length}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">العاملة: </span>
            <span className="font-bold text-success">
              {vehicles.filter((v) => v.status === 'operational').length}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">خارج الخدمة: </span>
            <span className="font-bold text-destructive">
              {vehicles.filter((v) => v.status === 'out-of-service').length}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">قيد الصيانة: </span>
            <span className="font-bold text-warning">
              {vehicles.filter((v) => v.status === 'maintenance').length}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
