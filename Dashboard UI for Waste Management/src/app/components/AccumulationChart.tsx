import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export function AccumulationChart() {
  const data = [
    { zone: 'المنطقة الشمالية', normal: 15, medium: 8, critical: 2 },
    { zone: 'المنطقة الجنوبية', normal: 10, medium: 12, critical: 5 },
    { zone: 'المنطقة الشرقية', normal: 18, medium: 6, critical: 1 },
    { zone: 'المنطقة الغربية', normal: 12, medium: 10, critical: 3 },
    { zone: 'المنطقة الوسطى', normal: 14, medium: 9, critical: 2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-1">مستوى التراكم حسب المناطق</h3>
      <p className="text-sm text-muted-foreground mb-6">
        توزيع المناطق حسب درجة تراكم النفايات
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            type="category"
            dataKey="zone"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          />
          <YAxis
            type="number"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
            label={{ value: 'عدد المناطق الفرعية', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                normal: 'طبيعي',
                medium: 'متوسط',
                critical: 'حرج',
              };
              return labels[value] || value;
            }}
          />
          <Bar key="normal-bar" dataKey="normal" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar key="medium-bar" dataKey="medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar key="critical-bar" dataKey="critical" stackId="a" fill="#dc2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span className="text-sm text-muted-foreground">طبيعي</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning"></div>
          <span className="text-sm text-muted-foreground">متوسط</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive"></div>
          <span className="text-sm text-muted-foreground">حرج</span>
        </div>
      </div>
    </motion.div>
  );
}
