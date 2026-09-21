import { Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

interface SmartInsightBoxProps {
  criticalZonesCount: number;
}

export function SmartInsightBox({ criticalZonesCount }: SmartInsightBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5 shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-primary mb-2">تحليل ذكي</h3>
          <p className="text-foreground leading-relaxed">
            بسبب نقص عدد المركبات، هناك <span className="font-bold text-warning">{criticalZonesCount} مناطق</span> معرضة للتأخير خلال الساعات القادمة. يُنصح بإعادة توزيع المركبات أو تعديل المسارات للتقليل من التأخير.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
