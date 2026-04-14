import { Eye, Edit, CheckCircle, Clock, XCircle, AlertOctagon } from 'lucide-react';
import { motion } from 'motion/react';

export function DriversTable() {
  const drivers = [
    {
      id: 1,
      name: 'أحمد محمد',
      vehicle: 'مركبة 1',
      status: 'on-duty' as const,
      reason: '-',
      zone: 'المنطقة الشمالية',
      lastUpdate: 'منذ 10 دقائق',
    },
    {
      id: 2,
      name: 'سارة أحمد',
      vehicle: 'مركبة 2',
      status: 'on-duty' as const,
      reason: '-',
      zone: 'المنطقة الغربية',
      lastUpdate: 'منذ 15 دقيقة',
    },
    {
      id: 3,
      name: 'محمد علي',
      vehicle: 'مركبة 3',
      status: 'unavailable' as const,
      reason: 'إجازة',
      zone: '-',
      lastUpdate: 'منذ ساعة',
    },
    {
      id: 4,
      name: 'فاطمة حسن',
      vehicle: 'مركبة 4',
      status: 'available' as const,
      reason: '-',
      zone: 'المنطقة الصناعية',
      lastUpdate: 'منذ 5 دقائق',
    },
    {
      id: 5,
      name: 'خالد يوسف',
      vehicle: 'مركبة 5',
      status: 'on-duty' as const,
      reason: '-',
      zone: 'المنطقة الجنوبية',
      lastUpdate: 'منذ 20 دقيقة',
    },
    {
      id: 6,
      name: 'نور الدين',
      vehicle: '-',
      status: 'unavailable' as const,
      reason: 'ظرف طارئ',
      zone: '-',
      lastUpdate: 'منذ ساعتين',
    },
    {
      id: 7,
      name: 'ليلى حسين',
      vehicle: 'مركبة 7',
      status: 'available' as const,
      reason: '-',
      zone: 'المنطقة الوسطى',
      lastUpdate: 'منذ دقيقة',
    },
  ];

  const statusConfig = {
    available: {
      label: 'متاح',
      icon: CheckCircle,
      classes: 'bg-success/10 text-success border-success/30',
    },
    'on-duty': {
      label: 'في مهمة',
      icon: Clock,
      classes: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
    unavailable: {
      label: 'غير متاح',
      icon: XCircle,
      classes: 'bg-muted text-muted-foreground border-border',
    },
    stopped: {
      label: 'متوقف',
      icon: AlertOctagon,
      classes: 'bg-destructive/10 text-destructive border-destructive/30',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border shadow-lg"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">قائمة السائقين</h3>
        <p className="text-sm text-muted-foreground mt-1">
          جميع السائقين مع حالتهم الحالية والمناطق المكلفين بها
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="border-b border-border">
              <th className="text-right p-4 font-semibold text-foreground">اسم السائق</th>
              <th className="text-right p-4 font-semibold text-foreground">المركبة</th>
              <th className="text-right p-4 font-semibold text-foreground">الحالة</th>
              <th className="text-right p-4 font-semibold text-foreground">سبب عدم التوفر</th>
              <th className="text-right p-4 font-semibold text-foreground">المنطقة المكلف بها</th>
              <th className="text-right p-4 font-semibold text-foreground">آخر تحديث</th>
              <th className="text-center p-4 font-semibold text-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, index) => {
              const StatusIcon = statusConfig[driver.status].icon;
              return (
                <motion.tr
                  key={driver.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-semibold text-foreground">{driver.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">{driver.vehicle}</span>
                  </td>
                  <td className="p-4">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig[driver.status].classes}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-semibold">{statusConfig[driver.status].label}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {driver.status === 'unavailable' ? (
                      <span className="text-sm text-destructive font-medium">{driver.reason}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">{driver.reason}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{driver.zone}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-muted-foreground">{driver.lastUpdate}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
                        <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
                        <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {drivers.map((driver, index) => {
          const StatusIcon = statusConfig[driver.status].icon;
          return (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{driver.name}</h4>
                  <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig[driver.status].classes}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span className="text-xs font-semibold">{statusConfig[driver.status].label}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {driver.status === 'unavailable' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">السبب:</span>
                    <span className="text-sm text-destructive font-medium">{driver.reason}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">المنطقة:</span>
                  <span className="text-sm text-foreground">{driver.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">آخر تحديث:</span>
                  <span className="text-xs text-muted-foreground">{driver.lastUpdate}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">تعديل</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">تفاصيل</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
