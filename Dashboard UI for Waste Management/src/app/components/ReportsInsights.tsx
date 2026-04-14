import { Lightbulb, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ReportsInsights() {
  const insights = [
    {
      id: 1,
      text: 'زيادة عدد التعديلات في منتصف الأسبوع تؤثر على استقرار الخطة',
      icon: AlertCircle,
      type: 'warning' as const,
    },
    {
      id: 2,
      text: 'نقص المركبات يرفع متوسط التأخير بنسبة 40٪',
      icon: TrendingUp,
      type: 'warning' as const,
    },
    {
      id: 3,
      text: 'إعادة التوزيع ناجحة في معظم الحالات بنسبة 85٪',
      icon: CheckCircle,
      type: 'success' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 shadow-md"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-primary">تحليل ذكي</h3>
          <p className="text-sm text-muted-foreground">رؤى مستخلصة من البيانات</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                insight.type === 'warning'
                  ? 'bg-warning/5 border border-warning/20'
                  : 'bg-success/5 border border-success/20'
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  insight.type === 'warning' ? 'text-warning' : 'text-success'
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  insight.type === 'warning' ? 'text-warning' : 'text-success'
                }`}
              >
                {insight.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
