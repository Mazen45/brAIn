import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export function QuickInsights() {
  // The routing algorithm dispatches every available driver under normal
  // circumstances (see planSmartRoutes), so "active vehicles" matches
  // "available drivers" exactly each day, not just stays under it.
  const data = [
    { name: 'السبت', drivers: 10, vehicles: 10 },
    { name: 'الأحد', drivers: 8, vehicles: 8 },
    { name: 'الإثنين', drivers: 15, vehicles: 15 },
    { name: 'الثلاثاء', drivers: 15, vehicles: 15 },
    { name: 'الأربعاء', drivers: 14, vehicles: 14 },
    { name: 'الخميس', drivers: 15, vehicles: 15 },
    { name: 'الجمعة', drivers: 13, vehicles: 13 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-1">نظرة عامة أسبوعية</h3>
      <p className="text-sm text-muted-foreground mb-6">توفر السائقين والمركبات</p>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="name"
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
          <Bar key="drivers-bar" dataKey="drivers" fill="#1a5c3a" radius={[8, 8, 0, 0]} />
          <Bar key="vehicles-bar" dataKey="vehicles" fill="#34d399" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-sm text-muted-foreground">السائقون المتاحون</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-2"></div>
          <span className="text-sm text-muted-foreground">المركبات النشطة</span>
        </div>
      </div>
    </motion.div>
  );
}
