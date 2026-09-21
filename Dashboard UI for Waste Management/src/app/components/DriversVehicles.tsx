import { motion } from 'motion/react';
import { DriversVehiclesSummary } from './DriversVehiclesSummary';
import { DriversTable } from './DriversTable';
import { VehicleOverview } from './VehicleOverview';
import { QuickStatusUpdate } from './QuickStatusUpdate';
import { StatusAlerts } from './StatusAlerts';
import type { SmartRoutingPlanState } from '../hooks/useSmartRoutingPlan';
import type { FleetDataSource } from '../hooks/useFleetDataSource';

interface DriversVehiclesProps {
  smartRouting: SmartRoutingPlanState;
  fleetDataSource: FleetDataSource;
}

export function DriversVehicles({ smartRouting, fleetDataSource }: DriversVehiclesProps) {
  const { trucks, plan } = smartRouting;

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
        <DriversVehiclesSummary metrics={plan.metrics} />

        {/* Status Alerts */}
        <StatusAlerts metrics={plan.metrics} />

        {/* Quick Status Update */}
        <QuickStatusUpdate
          trucks={trucks}
          onUpdateDriverAvailability={fleetDataSource.setDriverAvailability}
          onUpdateVehicleStatus={fleetDataSource.setTruckStatus}
        />

        {/* Drivers Table */}
        <DriversTable trucks={trucks} routes={plan.routes} />

        {/* Vehicle Overview */}
        <VehicleOverview trucks={trucks} routes={plan.routes} />
      </div>
    </div>
  );
}
