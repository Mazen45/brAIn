import { motion } from 'motion/react';
import { AnalysisSummaryCards } from './AnalysisSummaryCards';
import { AccumulationChart } from './AccumulationChart';
import { VehicleImpactSection } from './VehicleImpactSection';
import { DelayedZonesSection } from './DelayedZonesSection';
import { HighPriorityZones } from './HighPriorityZones';
import { SmartInsightBox } from './SmartInsightBox';
import { AnalysisFilters } from './AnalysisFilters';
import { useState } from 'react';

export function WasteAnalysis() {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedResources, setSelectedResources] = useState<string>('all');

  return (
    <div className="flex-1 overflow-auto" dir="rtl">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            تحليل مناطق تراكم النفايات
          </h1>
          <p className="text-muted-foreground">
            عرض وتحليل المناطق حسب مستوى التراكم وتأثير الموارد
          </p>
        </motion.div>

        {/* Filters */}
        <AnalysisFilters
          selectedZone={selectedZone}
          selectedLevel={selectedLevel}
          selectedResources={selectedResources}
          onZoneChange={setSelectedZone}
          onLevelChange={setSelectedLevel}
          onResourcesChange={setSelectedResources}
        />

        {/* Summary Cards */}
        <AnalysisSummaryCards />

        {/* Smart Insight Box */}
        <SmartInsightBox />

        {/* Accumulation Chart */}
        <AccumulationChart />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Impact */}
          <VehicleImpactSection />

          {/* Delayed Zones */}
          <DelayedZonesSection />
        </div>

        {/* High Priority Zones */}
        <HighPriorityZones />
      </div>
    </div>
  );
}
