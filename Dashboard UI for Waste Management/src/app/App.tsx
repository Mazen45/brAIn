import { useState } from 'react';
import { SidebarArabic } from './components/SidebarArabic';
import { MobileSidebarArabic } from './components/MobileSidebarArabic';
import { TopNavArabic } from './components/TopNavArabic';
import { OverviewCard } from './components/OverviewCard';
import { AlertBanner } from './components/AlertBanner';
import { QuickInsights } from './components/QuickInsights';
import { QuickActions } from './components/QuickActions';
import { MapView } from './components/MapView';
import { WasteAnalysis } from './components/WasteAnalysis';
import { RoutePlan } from './components/RoutePlan';
import { DriversVehicles } from './components/DriversVehicles';
import { Reports } from './components/Reports';
import { AlertsPage } from './components/AlertsPage';
import { DataManagement } from './components/DataManagement';
import { UpdatesBottomSheet } from './components/UpdatesBottomSheet';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserX, Truck, RefreshCw, Activity } from 'lucide-react';
import { PLAN_MODIFICATIONS_TODAY } from './lib/wasteFleetData';
import { useSmartRoutingPlan } from './hooks/useSmartRoutingPlan';
import { useFleetDataSource } from './hooks/useFleetDataSource';
import { useRoadHazards } from './hooks/useRoadHazards';

export default function App() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);

  // One shared fleet-data source (demo or the municipality's own entered
  // depots/trucks/containers), one shared set of dispatcher-marked road
  // closures/traffic jams, and one shared routing computation for the whole
  // app - every page (dashboard, map, route plan, drivers & vehicles,
  // alerts) reads from the same trucks/containers/plan instead of each
  // holding its own mock data, so numbers can never drift apart between
  // pages again.
  const fleetDataSource = useFleetDataSource();
  const roadHazards = useRoadHazards();
  const smartRouting = useSmartRoutingPlan(
    fleetDataSource.trucks,
    fleetDataSource.containers,
    roadHazards.hazards,
    fleetDataSource.mode === 'demo' ? fleetDataSource.regenerateDemo : undefined
  );
  const { metrics, unassignedContainers } = smartRouting.plan;

  const availableDrivers = metrics.availableTrucks;
  const unavailableDrivers = metrics.driversUnavailable;
  const activeVehicles = metrics.trucksUsed;
  const modifiedPlans = PLAN_MODIFICATIONS_TODAY;
  // A real operational problem: due containers the fleet couldn't fit today,
  // rather than an arbitrary threshold on a hardcoded "available drivers" figure.
  const hasIssue = unassignedContainers.length > 0;

  return (
    <div className="size-full flex bg-background overflow-hidden" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarArabic activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebarArabic activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {activeItem !== 'map' && (
          <TopNavArabic onOpenUpdates={() => setIsUpdatesOpen(true)} dataMode={fleetDataSource.mode} />
        )}

        {activeItem === 'dashboard' && (
          <main className="flex-1 p-4 md:p-8 overflow-auto" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <OverviewCard
                  title="السائقون المتاحون اليوم"
                  value={availableDrivers}
                  icon={Users}
                  variant="success"
                  delay={0}
                />
                <OverviewCard
                  title="السائقون غير المتاحين"
                  value={unavailableDrivers}
                  icon={UserX}
                  variant={unavailableDrivers > 0 ? 'warning' : 'default'}
                  delay={0.1}
                />
                <OverviewCard
                  title="المركبات النشطة"
                  value={activeVehicles}
                  icon={Truck}
                  variant="success"
                  delay={0.2}
                />
                <OverviewCard
                  title="التعديلات اليوم"
                  value={modifiedPlans}
                  icon={RefreshCw}
                  variant="default"
                  delay={0.3}
                />
                <OverviewCard
                  title="حالة النظام"
                  value="جيد"
                  icon={Activity}
                  variant={hasIssue ? 'warning' : 'success'}
                  delay={0.4}
                />
              </div>

              {/* Alert Banner */}
              <AlertBanner
                hasIssue={hasIssue}
                message={
                  hasIssue
                    ? `تحذير: ${unassignedContainers.length} حاوية مستحقة لم يتم تعيينها لعدم توفر سعة كافية في الأسطول الحالي.`
                    : 'جميع الأنظمة تعمل بشكل طبيعي. عدد كافٍ من السائقين والمركبات متاحة.'
                }
              />

              {/* Quick Insights and Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <QuickInsights />
                </div>
                <div>
                  <QuickActions onNavigate={setActiveItem} />
                </div>
              </div>
            </div>
          </main>
        )}

        {activeItem === 'map' && (
          <MapView
            smartRouting={smartRouting}
            roadHazards={roadHazards}
            isUpdatesOpen={isUpdatesOpen}
            onOpenUpdates={() => setIsUpdatesOpen(true)}
          />
        )}

        {activeItem === 'analysis' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <WasteAnalysis metrics={metrics} />
          </main>
        )}

        {activeItem === 'route' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <RoutePlan smartRouting={smartRouting} />
          </main>
        )}

        {activeItem === 'drivers' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <DriversVehicles smartRouting={smartRouting} fleetDataSource={fleetDataSource} />
          </main>
        )}

        {activeItem === 'reports' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <Reports />
          </main>
        )}

        {activeItem === 'alerts' && <AlertsPage metrics={metrics} />}

        {activeItem === 'data' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <DataManagement fleetDataSource={fleetDataSource} />
          </main>
        )}

        {![
          'dashboard',
          'map',
          'analysis',
          'route',
          'drivers',
          'reports',
          'alerts',
          'data',
        ].includes(activeItem) && (
          <main className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center" dir="rtl">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-2">قريباً</h3>
              <p className="text-muted-foreground">هذه الصفحة قيد التطوير</p>
            </div>
          </main>
        )}
      </div>

      {/* App-wide dim overlay + recent-updates sheet, reachable from the
          notification bell on every page and from the map's own controls. */}
      <AnimatePresence>
        {isUpdatesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
            style={{ zIndex: 1300 }}
            onClick={() => setIsUpdatesOpen(false)}
          />
        )}
      </AnimatePresence>
      <UpdatesBottomSheet isOpen={isUpdatesOpen} onClose={() => setIsUpdatesOpen(false)} />
    </div>
  );
}