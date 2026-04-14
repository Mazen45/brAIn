import { motion } from 'motion/react';
import { DriversVehiclesSummary } from './DriversVehiclesSummary';
import { DriversTable } from './DriversTable';
import { VehicleOverview } from './VehicleOverview';
import { QuickStatusUpdate } from './QuickStatusUpdate';
import { StatusAlerts } from './StatusAlerts';

export function DriversVehicles() {
  return (
    <div className="flex-1 overflow-auto" dir="rtl">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة السائقين والمركبات</h1>
          <p className="text-muted-foreground">
            متابعة حالة السائقين والمركبات وتأثيرها على خطة التوزيع
          </p>
        </motion.div>

        {/* Summary Cards */}
        <DriversVehiclesSummary />

        {/* Status Alerts */}
        <StatusAlerts />

        {/* Quick Status Update */}
        <QuickStatusUpdate />

        {/* Drivers Table */}
        <DriversTable />

        {/* Vehicle Overview */}
        <VehicleOverview />
      </div>
    </div>
  );
}
