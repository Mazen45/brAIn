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
import { Users, UserX, Truck, RefreshCw, Activity } from 'lucide-react';

export default function App() {
  const [activeItem, setActiveItem] = useState('dashboard');

  const availableDrivers = 11;
  const unavailableDrivers = 4;
  const activeVehicles = 13;
  const modifiedPlans = 2;
  const hasIssue = availableDrivers < 12;

  return (
    <div className="size-full flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarArabic activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebarArabic activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {activeItem !== 'map' && <TopNavArabic />}

        {activeItem === 'dashboard' && (
          <main className="flex-1 p-4 md:p-8 overflow-auto" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <OverviewCard
                  title="السائقون المتاحون اليوم"
                  value={availableDrivers}
                  icon={Users}
                  variant={availableDrivers < 12 ? 'warning' : 'success'}
                  delay={0}
                />
                <OverviewCard
                  title="السائقون غير المتاحين"
                  value={unavailableDrivers}
                  icon={UserX}
                  variant={unavailableDrivers > 3 ? 'warning' : 'default'}
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
                    ? 'تحذير: عدد السائقين المتاحين اليوم منخفض. يرجى النظر في تعديل جداول المسارات.'
                    : 'جميع الأنظمة تعمل بشكل طبيعي. عدد كافٍ من السائقين والمركبات متاحة.'
                }
              />

              {/* Quick Insights and Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <QuickInsights />
                </div>
                <div>
                  <QuickActions />
                </div>
              </div>
            </div>
          </main>
        )}

        {activeItem === 'map' && <MapView />}

        {activeItem === 'analysis' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <TopNavArabic />
            <WasteAnalysis />
          </main>
        )}

        {activeItem === 'route' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <TopNavArabic />
            <RoutePlan />
          </main>
        )}

        {activeItem === 'drivers' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <TopNavArabic />
            <DriversVehicles />
          </main>
        )}

        {activeItem === 'reports' && (
          <main className="flex-1 overflow-auto" dir="rtl">
            <TopNavArabic />
            <Reports />
          </main>
        )}

        {activeItem !== 'dashboard' && activeItem !== 'map' && activeItem !== 'analysis' && activeItem !== 'route' && activeItem !== 'drivers' && activeItem !== 'reports' && (
          <main className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center" dir="rtl">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-2">قريباً</h3>
              <p className="text-muted-foreground">هذه الصفحة قيد التطوير</p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}