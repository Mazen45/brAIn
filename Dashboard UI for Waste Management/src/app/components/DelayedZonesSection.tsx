import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function DelayedZonesSection() {
  const delayedZones = [
    {
      id: 1,
      name: 'المنطقة الجنوبية - حي السلام',
      reason: 'نقص مركبات',
      severity: 'high' as const,
    },
    {
      id: 2,
      name: 'المنطقة الشرقية - حي الزهور',
      reason: 'غياب سائق',
      severity: 'medium' as const,
    },
    {
      id: 3,
      name: 'المنطقة الوسطى - المركز',
      reason: 'ضغط عالي',
      severity: 'high' as const,
    },
    {
      id: 4,
      name: 'المنطقة الغربية - حي النور',
      reason: 'نقص مركبات',
      severity: 'medium' as const,
    },
    {
      id: 5,
      name: 'المنطقة الشمالية - البلدة القديمة',
      reason: 'ضغط عالي',
      severity: 'high' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">المناطق المتوقع تأخرها</h3>
          <p className="text-sm text-muted-foreground">مناطق قد تواجه تأخيراً في الخدمة</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {delayedZones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.05 }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              zone.severity === 'high'
                ? 'bg-destructive/5 border-destructive/30'
                : 'bg-warning/5 border-warning/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{zone.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  السبب: <span className="font-medium text-foreground">{zone.reason}</span>
                </p>
              </div>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  zone.severity === 'high'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-warning/20 text-warning'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                {zone.severity === 'high' ? 'عالي' : 'متوسط'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
