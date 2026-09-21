import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { PLAN_CHANGES_BY_DAY } from '../lib/reportsData';

export function PlanChangesChart() {
  const data = PLAN_CHANGES_BY_DAY;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">تغيرات الخطة عبر الزمن</h3>
          <p className="text-sm text-muted-foreground">عدد مرات تعديل الخطة خلال الأسبوع</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
            label={{
              value: 'عدد التعديلات',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#64748b', fontSize: 12 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="changes"
            stroke="#1a5c3a"
            strokeWidth={3}
            dot={{ fill: '#1a5c3a', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">الملاحظة:</span> زيادة في التعديلات منتصف الأسبوع
        </p>
      </div>
    </motion.div>
  );
}
