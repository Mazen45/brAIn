import { motion } from 'motion/react';
import { AnalysisSummaryCards } from './AnalysisSummaryCards';
import { VehicleImpactSection } from './VehicleImpactSection';
import { SmartInsightBox } from './SmartInsightBox';
import { AnalysisFilters } from './AnalysisFilters';
import { ZonesList } from './ZonesList';
import { useMemo, useState } from 'react';
import { WASTE_ZONES } from '../lib/wasteZones';
import type { RoutingMetrics } from '../lib/wasteRoutingTypes';

interface WasteAnalysisProps {
  metrics: RoutingMetrics;
}

export function WasteAnalysis({ metrics }: WasteAnalysisProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedResources, setSelectedResources] = useState<string>('all');

  const filteredZones = useMemo(
    () =>
      WASTE_ZONES.filter(
        (zone) =>
          (selectedLevel === 'all' || zone.level === selectedLevel) &&
          (selectedResources === 'all' || zone.resourceStatus === selectedResources)
      ),
    [selectedLevel, selectedResources]
  );

  const criticalZonesCount = WASTE_ZONES.filter((z) => z.level === 'critical').length;
  const delayedZonesCount = WASTE_ZONES.filter((z) => z.level === 'medium').length;
  const hasResourceShortage = WASTE_ZONES.some((z) => z.resourceStatus === 'shortage');

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
        <AnalysisSummaryCards
          criticalZonesCount={criticalZonesCount}
          delayedZonesCount={delayedZonesCount}
          hasResourceShortage={hasResourceShortage}
          availableVehicles={metrics.trucksUsed}
        />

        {/* Zones matching the current filter */}
        <ZonesList zones={filteredZones} totalCount={WASTE_ZONES.length} />

        {/* Smart Insight Box */}
        <SmartInsightBox criticalZonesCount={criticalZonesCount} />

        {/* Vehicle Impact */}
        <VehicleImpactSection metrics={metrics} />
      </div>
    </div>
  );
}
