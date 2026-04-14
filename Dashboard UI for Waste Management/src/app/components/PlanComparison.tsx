import { motion } from 'motion/react';
import { Truck, User, MapPin, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

interface PlanComparisonProps {
  isRegenerating: boolean;
}

export function PlanComparison({ isRegenerating }: PlanComparisonProps) {
  const originalPlan = [
    {
      id: 'v1',
      name: 'مركبة 1',
      driver: 'أحمد محمد',
      zones: ['المنطقة الشمالية', 'المنطقة الوسطى', 'المنطقة الشرقية'],
      status: 'active' as const,
    },
    {
      id: 'v2',
      name: 'مركبة 2',
      driver: 'سارة أحمد',
      zones: ['المنطقة الغربية', 'المنطقة الجنوبية'],
      status: 'active' as const,
    },
    {
      id: 'v3',
      name: 'مركبة 3',
      driver: 'محمد علي',
      zones: ['المنطقة الجنوبية - حي السلام'],
      status: 'active' as const,
    },
  ];

  const currentPlan = [
    {
      id: 'v1',
      name: 'مركبة 1',
      driver: 'أحمد محمد',
      zones: [
        'المنطقة الشمالية',
        'المنطقة الوسطى',
        'المنطقة الشرقية',
        'المنطقة الجنوبية - حي السلام',
      ],
      status: 'active' as const,
      hasChanges: true,
      newZone: 'المنطقة الجنوبية - حي السلام',
    },
    {
      id: 'v2',
      name: 'مركبة 2',
      driver: 'سارة أحمد',
      zones: ['المنطقة الغربية', 'المنطقة الجنوبية'],
      status: 'active' as const,
      hasChanges: false,
    },
    {
      id: 'v3',
      name: 'مركبة 3',
      driver: 'محمد علي',
      zones: [],
      status: 'unavailable' as const,
      hasChanges: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Original Plan */}
      <div className="bg-card rounded-xl border-2 border-border p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">الخطة الأصلية</h3>
            <p className="text-sm text-muted-foreground">الخطة قبل التعديلات</p>
          </div>
        </div>

        <div className="space-y-4">
          {originalPlan.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{vehicle.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <User className="w-3 h-3" />
                    <span>{vehicle.driver}</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">
                  نشط
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>المناطق ({vehicle.zones.length})</span>
                </div>
                <div className="space-y-1.5">
                  {vehicle.zones.map((zone, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border"
                    >
                      {zone}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Plan After Modification */}
      <div className="bg-card rounded-xl border-2 border-primary/30 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">الخطة الحالية بعد التعديل</h3>
            <p className="text-sm text-muted-foreground">الخطة المحدثة حسب الموارد المتاحة</p>
          </div>
        </div>

        <div className="space-y-4">
          {currentPlan.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                vehicle.hasChanges
                  ? 'bg-warning/5 border-warning/30'
                  : 'bg-muted/30 border-border'
              } ${isRegenerating ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    vehicle.status === 'unavailable'
                      ? 'bg-muted-foreground/10'
                      : 'bg-primary/10'
                  }`}
                >
                  <Truck
                    className={`w-5 h-5 ${
                      vehicle.status === 'unavailable' ? 'text-muted-foreground' : 'text-primary'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{vehicle.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <User className="w-3 h-3" />
                    <span>{vehicle.driver}</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    vehicle.status === 'unavailable'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {vehicle.status === 'unavailable' ? 'غير متاح' : 'نشط'}
                </div>
              </div>

              {vehicle.hasChanges && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">تمت إعادة التوزيع</span>
                </div>
              )}

              {vehicle.status === 'active' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>المناطق ({vehicle.zones.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {vehicle.zones.map((zone, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-sm border ${
                          zone === vehicle.newZone
                            ? 'bg-success/10 text-success border-success/30 font-semibold'
                            : 'bg-background text-foreground border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {zone === vehicle.newZone && (
                            <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span>{zone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                  لا توجد مناطق مخصصة
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
