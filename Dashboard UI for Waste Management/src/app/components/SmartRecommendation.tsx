import { Lightbulb, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export function SmartRecommendation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-success/5 border-2 border-success/20 rounded-xl p-5 shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-success" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-success">اقتراح النظام</h3>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-foreground leading-relaxed">
            يُفضل إعادة توزيع <span className="font-bold text-success">المنطقة الغربية</span> على{' '}
            <span className="font-bold text-success">المركبة 2</span> لتقليل التأخير وتحسين وقت الاستجابة.
            هذا التوزيع سيقلل المسافة الكلية بنسبة 15%.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
