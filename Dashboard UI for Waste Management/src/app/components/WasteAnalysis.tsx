import { motion } from 'motion/react';
import { AnalysisSummaryCards } from './AnalysisSummaryCards';
import { VehicleImpactSection } from './VehicleImpactSection';
import { SmartInsightBox } from './SmartInsightBox';
import { AnalysisFilters } from './AnalysisFilters';
import { useState } from 'react';

export function WasteAnalysis() {
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
            تحليل تراكم النفايات
          </h1>
          <p className="text-muted-foreground">
            عرض وتحليل مستوى التراكم وتأثير الموارد
          </p>
        </motion.div>

        {/* Filters */}
        <AnalysisFilters
          selectedLevel={selectedLevel}
          selectedResources={selectedResources}
          onLevelChange={setSelectedLevel}
          onResourcesChange={setSelectedResources}
        />

        {/* Summary Cards */}
        <AnalysisSummaryCards />

        {/* Smart Insight Box */}
        <SmartInsightBox />

        {/* Vehicle Impact */}
        <VehicleImpactSection />
      </div>
    </div>
  );
}
