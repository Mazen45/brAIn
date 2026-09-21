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
import { REPORT_CONTENT_ELEMENT_ID } from '../lib/reportExport';

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedType, setSelectedType] = useState('all');

  return (
    <div className="flex-1 overflow-auto" dir="rtl">
      <div id={REPORT_CONTENT_ELEMENT_ID} className="max-w-7xl mx-auto p-6 space-y-6 bg-background">
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
            <ExportOptions selectedPeriod={selectedPeriod} selectedType={selectedType} />
          </div>
        </motion.div>

        {/* Filters */}
        <ReportsFilters
          selectedPeriod={selectedPeriod}
          selectedType={selectedType}
          onPeriodChange={setSelectedPeriod}
          onTypeChange={setSelectedType}
        />

        {/* Key Metrics */}
        <ReportsMetrics selectedPeriod={selectedPeriod} />

        {/* Smart Insights */}
        <ReportsInsights />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Changes Over Time */}
          <PlanChangesChart />

          {/* Driver Absence Impact */}
          <DriverAbsenceImpact selectedType={selectedType} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Redistribution Success */}
          <RedistributionSuccess />

          {/* Average Delay */}
          <AverageDelay selectedType={selectedType} />
        </div>
      </div>
    </div>
  );
}
