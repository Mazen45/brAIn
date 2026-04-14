import { useState } from 'react';
import { motion } from 'motion/react';
import { ReportsMetrics } from './ReportsMetrics';
import { ReportsFilters } from './ReportsFilters';
import { PlanChangesChart } from './PlanChangesChart';
import { DriverAbsenceImpact } from './DriverAbsenceImpact';
import { RedistributionSuccess } from './RedistributionSuccess';
import { AverageDelay } from './AverageDelay';
import { ReportsInsights } from './ReportsInsights';
import { ExportOptions } from './ExportOptions';

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

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
              <h1 className="text-3xl font-bold text-foreground mb-2">التقارير</h1>
              <p className="text-muted-foreground">تحليل أداء النظام وتأثير التغيرات التشغيلية</p>
            </div>
            <ExportOptions />
          </div>
        </motion.div>

        {/* Filters */}
        <ReportsFilters
          selectedPeriod={selectedPeriod}
          selectedZone={selectedZone}
          selectedType={selectedType}
          onPeriodChange={setSelectedPeriod}
          onZoneChange={setSelectedZone}
          onTypeChange={setSelectedType}
        />

        {/* Key Metrics */}
        <ReportsMetrics />

        {/* Smart Insights */}
        <ReportsInsights />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Changes Over Time */}
          <PlanChangesChart />

          {/* Driver Absence Impact */}
          <DriverAbsenceImpact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Redistribution Success */}
          <RedistributionSuccess />

          {/* Average Delay */}
          <AverageDelay />
        </div>
      </div>
    </div>
  );
}
