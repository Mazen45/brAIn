import { useState } from 'react';
import { motion } from 'motion/react';
import { RouteSummaryCards } from './RouteSummaryCards';
import { RouteActions } from './RouteActions';
import { PlanComparison } from './PlanComparison';
import { VehicleAssignmentTable } from './VehicleAssignmentTable';
import { ChangeReasons } from './ChangeReasons';
import { SmartRecommendation } from './SmartRecommendation';

export function RoutePlan() {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsRegenerating(false);
    }, 2000);
  };

  const handleApprove = () => {
    // Handle approval
    alert('تم اعتماد الخطة بنجاح');
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
              onRegenerate={handleRegenerate}
              onApprove={handleApprove}
              isRegenerating={isRegenerating}
            />
          </div>
        </motion.div>

        {/* Summary Cards */}
        <RouteSummaryCards />

        {/* Smart Recommendation */}
        <SmartRecommendation />

        {/* Plan Comparison */}
        <PlanComparison isRegenerating={isRegenerating} />

        {/* Change Reasons */}
        <ChangeReasons />

        {/* Vehicle Assignment Table */}
        <VehicleAssignmentTable />
      </div>
    </div>
  );
}
