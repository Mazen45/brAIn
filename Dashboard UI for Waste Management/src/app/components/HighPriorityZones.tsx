import { AlertOctagon, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export function HighPriorityZones() {
  const priorityZones = [
    {
      id: 1,
      name: 'المنطقة الجنوبية - السوق المركزي',
      reason: 'تراكم عالي',
      description: 'منطقة تجارية ذات كثافة عالية',
    },
    {
      id: 2,
      name: 'المنطقة الوسطى - المستشفى العام',
      reason: 'حساسة خدمياً',
      description: 'منطقة صحية تتطلب نظافة مستمرة',
    },
    {
      id: 3,
      name: 'المنطقة الشرقية - الحي السكني الكبير',
      reason: 'كثافة سكانية',
      description: 'أكثر من 15,000 نسمة',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
          <Flame className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">مناطق يجب الحفاظ عليها ضمن الخطة</h3>
          <p className="text-sm text-muted-foreground">مناطق ذات أولوية قصوى لا يجب تأخيرها</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priorityZones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="relative bg-destructive/5 border-2 border-destructive/30 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {/* Priority Badge */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-destructive rounded-full">
                <AlertOctagon className="w-3 h-3 text-destructive-foreground" />
                <span className="text-xs font-bold text-destructive-foreground">أولوية قصوى</span>
              </div>
            </div>

            <div className="pt-6">
              <h4 className="font-bold text-foreground mb-2">{zone.name}</h4>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-destructive whitespace-nowrap mt-0.5">
                    السبب:
                  </span>
                  <span className="text-sm text-foreground font-semibold">{zone.reason}</span>
                </div>

                <p className="text-sm text-muted-foreground">{zone.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
