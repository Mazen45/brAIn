import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { UserX } from 'lucide-react';

export function DriverAbsenceImpact() {
  const data = [
    { day: 'السبت', absent: 2, delay: 8 },
    { day: 'الأحد', absent: 1, delay: 5 },
    { day: 'الإثنين', absent: 4, delay: 18 },
    { day: 'الثلاثاء', absent: 3, delay: 12 },
    { day: 'الأربعاء', absent: 4, delay: 20 },
    { day: 'الخميس', absent: 2, delay: 10 },
    { day: 'الجمعة', absent: 1, delay: 6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <UserX className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">تأثير غياب السائقين على الأداء</h3>
          <p className="text-sm text-muted-foreground">العلاقة بين غياب السائقين ومستوى التأخير</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
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
                absent: 'سائقين غائبين',
                delay: 'التأخير (دقيقة)',
              };
              return labels[value] || value;
            }}
          />
          <Bar key="absent-bar" dataKey="absent" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          <Bar key="delay-bar" dataKey="delay" fill="#dc2626" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
        <p className="text-sm text-warning font-medium">
          زيادة غياب السائقين تؤدي إلى ارتفاع التأخير بشكل ملحوظ
        </p>
      </div>
    </motion.div>
  );
}
