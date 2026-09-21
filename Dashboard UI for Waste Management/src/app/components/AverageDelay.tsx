import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { DELAY_BY_REASON } from '../lib/reportsData';

interface AverageDelayProps {
  selectedType: string;
}

export function AverageDelay({ selectedType }: AverageDelayProps) {
  const data =
    selectedType === 'all' ? DELAY_BY_REASON : DELAY_BY_REASON.filter((r) => r.type === selectedType);

  const averageDelay = Math.round(data.reduce((sum, r) => sum + r.delay, 0) / data.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">متوسط التأخير الناتج عن التغيرات</h3>
          <p className="text-sm text-muted-foreground">التأخير حسب نوع التغيير</p>
        </div>
      </div>

      {/* Average Metric */}
      <div className="mb-6 p-4 bg-warning/5 border border-warning/20 rounded-lg text-center">
        <div className="flex items-end justify-center gap-2">
          <span className="text-4xl font-bold text-warning">{averageDelay}</span>
          <span className="text-lg font-semibold text-warning mb-1">دقيقة</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {selectedType === 'all' ? 'متوسط التأخير العام' : `متوسط التأخير - ${data[0]?.reason}`}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
            label={{
              value: 'الدقائق',
              position: 'insideBottom',
              offset: -5,
              style: { fill: '#64748b', fontSize: 12 },
            }}
          />
          <YAxis
            type="category"
            dataKey="reason"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            formatter={(value) => [`${value} دقيقة`, 'التأخير']}
          />
          <Bar key="delay-bar-h" dataKey="delay" fill="#f59e0b" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">ملاحظة:</span> يتم حساب التأخير بناءً على وقت تنفيذ المهام الفعلي مقارنة بالمخطط
        </p>
      </div>
    </motion.div>
  );
}
