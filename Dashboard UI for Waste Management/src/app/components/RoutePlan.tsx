import { motion } from 'motion/react';
import { RouteSummaryCards } from './RouteSummaryCards';
import { RouteActions } from './RouteActions';
import { VehicleAssignmentTable } from './VehicleAssignmentTable';
import { ChangeReasons } from './ChangeReasons';
import { SmartRecommendation } from './SmartRecommendation';
import { SmartRoutingPanel } from './SmartRoutingPanel';
import { Toast } from './Toast';
import { useToast } from '../hooks/useToast';
import type { SmartRoutingPlanState } from '../hooks/useSmartRoutingPlan';

interface RoutePlanProps {
  smartRouting: SmartRoutingPlanState;
}

export function RoutePlan({ smartRouting }: RoutePlanProps) {
  const { message, showToast } = useToast();

  const handleApprove = () => {
    // Handle approval
    showToast('تم اعتماد الخطة بنجاح');
  };

  return (
    <div className="flex-1 overflow-auto" dir="rtl">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">خطة توزيع المركبات</h1>
              <p className="text-muted-foreground">
                إدارة ومقارنة الخطط وتحديث توزيع المركبات حسب الحالة الحالية
              </p>
            </div>
            <RouteActions
              onRegenerate={smartRouting.regenerate}
              onApprove={handleApprove}
              isRegenerating={smartRouting.isRegenerating}
            />
          </div>
        </motion.div>

        {/* Summary Cards */}
        <RouteSummaryCards metrics={smartRouting.plan.metrics} />

        {/* Smart Recommendation */}
        <SmartRecommendation />

        {/* Change Reasons */}
        <ChangeReasons />

        {/* Vehicle Assignment Table */}
        <VehicleAssignmentTable trucks={smartRouting.trucks} routes={smartRouting.plan.routes} />

        {/* Smart Routing Engine */}
        <div className="pt-4 border-t-2 border-border">
          <SmartRoutingPanel {...smartRouting} />
        </div>
      </div>

      <Toast message={message} />
    </div>
  );
}
