import { CheckCircle, WrenchIcon, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Truck, TruckRoute } from '../lib/wasteRoutingTypes';

interface VehicleAssignmentTableProps {
  trucks: Truck[];
  routes: TruckRoute[];
}

export function VehicleAssignmentTable({ trucks, routes }: VehicleAssignmentTableProps) {
  const assignments = trucks.map((truck) => {
    const route = routes.find((r) => r.truck.id === truck.id);
    const status = truck.status === 'maintenance' ? 'maintenance' : route ? 'active' : 'unavailable';
    return {
      id: truck.id,
      vehicle: truck.id,
      driver: truck.driver,
      tasks: route?.stops.length ?? 0,
      status: status as 'active' | 'unavailable' | 'maintenance',
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4">توزيع المهام على المركبات</h3>
      <p className="text-sm text-muted-foreground mb-6">
        جدول شامل بتوزيع المهام على كل مركبة في الأسطول، بحسب خطة اليوم
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b-2 border-border">
              <th className="text-right p-4 font-semibold text-foreground">المركبة</th>
              <th className="text-right p-4 font-semibold text-foreground">السائق</th>
              <th className="text-center p-4 font-semibold text-foreground">عدد المهام</th>
              <th className="text-center p-4 font-semibold text-foreground">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment, index) => (
              <motion.tr
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="p-4">
                  <span className="font-semibold text-foreground">{assignment.vehicle}</span>
                </td>
                <td className="p-4">
                  <span className="text-foreground">{assignment.driver}</span>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {assignment.tasks}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center">
                    {assignment.status === 'active' ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">نشط</span>
                      </div>
                    ) : assignment.status === 'maintenance' ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full">
                        <WrenchIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">صيانة</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-full">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">غير مكلّفة اليوم</span>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-sm text-muted-foreground">إجمالي المركبات: </span>
            <span className="font-bold text-foreground">{assignments.length}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">النشطة: </span>
            <span className="font-bold text-success">
              {assignments.filter((a) => a.status === 'active').length}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">قيد الصيانة: </span>
            <span className="font-bold text-warning">
              {assignments.filter((a) => a.status === 'maintenance').length}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">إجمالي المهام: </span>
            <span className="font-bold text-primary">
              {assignments.reduce((sum, a) => sum + a.tasks, 0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
