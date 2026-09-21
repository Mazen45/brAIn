import { Fragment, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip as LeafletTooltip } from 'react-leaflet';
import {
  ChevronDown,
  ChevronUp,
  Gauge,
  MapPinned,
  Recycle,
  RefreshCw,
  Route as RouteIcon,
  Truck as TruckIcon,
  Workflow,
} from 'lucide-react';
import { COLLECTION_THRESHOLD_PERCENT } from '../lib/smartRouting';
import { routeColor } from '../lib/routeColors';
import { depotIcon } from '../lib/mapIcons';
import type { SmartRoutingPlanState } from '../hooks/useSmartRoutingPlan';
import { HEBRON_CENTER } from './mapGeo';
import { containerColor } from './WasteContainerMarker';

export function SmartRoutingPanel({
  containers,
  plan,
  roadGeometry,
  isResolvingRoads,
  isRegenerating,
  regenerate,
  isUsingRealRoadDistances,
}: SmartRoutingPlanState) {
  const [expandedTruckId, setExpandedTruckId] = useState<string | null>(null);

  const depots = useMemo(() => {
    const seen = new Map<string, (typeof plan.routes)[number]['truck']>();
    plan.routes.forEach((r) => {
      if (!seen.has(r.truck.depotName)) seen.set(r.truck.depotName, r.truck);
    });
    return [...seen.values()];
  }, [plan.routes]);

  const handleRecalculate = () => {
    setExpandedTruckId(null);
    regenerate();
  };

  const { metrics, routes } = plan;
  const wasteCollectedTons = metrics.totalWasteCollectedLiters / 1000;

  const kpis = [
    {
      title: 'المركبات المستخدمة',
      value: `${metrics.trucksUsed} / ${metrics.availableTrucks}`,
      sub: `من أصل ${metrics.totalTrucks} مركبة في الأسطول`,
      icon: TruckIcon,
      color: 'primary' as const,
    },
    {
      title: 'الحاويات التي تم جمعها',
      value: `${metrics.collectedContainers} / ${metrics.dueContainers}`,
      sub: `من أصل ${metrics.totalContainers} حاوية في المدينة`,
      icon: Recycle,
      color: 'success' as const,
    },
    {
      title: 'إجمالي مسافة الجولات',
      value: `${metrics.totalDistanceKm.toFixed(1)} كم`,
      sub: `بدلاً من ${metrics.naiveDistanceKm.toFixed(0)} كم بالطريقة التقليدية`,
      icon: RouteIcon,
      color: 'primary' as const,
    },
    {
      title: 'توفير في المسافة',
      value: `${Math.max(0, metrics.distanceSavedPercent).toFixed(0)}%`,
      sub:
        metrics.trucksSavedCount > 0
          ? `و ${metrics.trucksSavedCount} مركبة أقل مقارنة بالخطة التقليدية`
          : 'بنفس عدد المركبات المستخدمة تقليدياً، عبر ترتيب أفضل للتوقفات',
      icon: Gauge,
      color: 'success' as const,
    },
    {
      title: 'النفايات المجمّعة',
      value: `${wasteCollectedTons.toFixed(2)} طن`,
      sub: `كفاءة ${metrics.litersPerKm.toFixed(0)} لتر لكل كم مقطوع`,
      icon: Workflow,
      color: 'warning' as const,
    },
  ];

  const colorStyles = {
    primary: 'bg-primary/10 border-primary/30 text-primary',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
  };
  const iconColorStyles = {
    primary: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header + explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">التوجيه الذكي لجمع النفايات</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              تقوم الخوارزمية بتجاهل الحاويات التي لا تزال شبه فارغة (أقل من {COLLECTION_THRESHOLD_PERCENT}%
              امتلاءً) لتوفير الوقود والوقت، ثم ترتّب الحاويات المستحقة حسب درجة الإلحاح (نسبة الامتلاء وخطر
              الفيضان ووقت آخر تفريغ)، وتوزّعها على أقرب مركبة متاحة ضمن سعتها المتبقية، وأخيراً تحسّن ترتيب
              التوقفات داخل كل مسار (خوارزمية 2-opt) لتقليل المسافة المقطوعة، ثم تُسقط كل مسار على شبكة
              الطرق الفعلية بدلاً من خطوط مستقيمة، لتعكس الطريق الذي سيسلكه السائق بالفعل. النتائج نفسها
              معروضة أيضاً على الخريطة الرئيسية.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleRecalculate}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'جارٍ إعادة الحساب...' : 'إعادة حساب المسارات'}
            </button>
            <span
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                isUsingRealRoadDistances ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              <MapPinned className="w-3 h-3" />
              {isUsingRealRoadDistances
                ? 'التوزيع محسوب على مسافات الطرق الفعلية'
                : 'التوزيع محسوب على الخط المستقيم (جارٍ جلب مسافات الطرق أو الأسطول كبير جداً)'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              className={`rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${colorStyles[kpi.color]}`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium opacity-90">{kpi.title}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColorStyles[kpi.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{kpi.value}</p>
              <p className="text-xs opacity-75">{kpi.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Map preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-card rounded-xl border-2 border-border shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b-2 border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">خريطة المسارات المحسّنة (على شبكة الطرق الفعلية)</h3>
            <AnimatePresence>
              {isResolvingRoads && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-primary flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  جارٍ الحساب...
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#dc2626' }} /> خطر فيضان
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} /> مستحقة الجمع
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} /> لم تستحق بعد
            </span>
          </div>
        </div>
        <div style={{ height: 420 }}>
          <MapContainer
            center={HEBRON_CENTER}
            zoom={13}
            minZoom={11}
            maxZoom={17}
            zoomControl={true}
            className="w-full h-full"
            style={{ direction: 'ltr' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {depots.map((depot) => (
              <Marker key={depot.depotName} position={depot.depot} icon={depotIcon}>
                <LeafletTooltip direction="top">{depot.depotName}</LeafletTooltip>
              </Marker>
            ))}

            {routes.map((route, i) => {
              const color = routeColor(i, routes.length);
              const positions =
                roadGeometry[route.truck.id] ??
                [route.truck.depot, ...route.stops.map((s) => s.container.position), route.truck.depot];
              return (
                <Polyline
                  key={route.truck.id}
                  positions={positions}
                  pathOptions={{ color, weight: 3, opacity: 0.75, lineCap: 'round', lineJoin: 'round' }}
                />
              );
            })}

            {containers.map((container) => (
              <CircleMarker
                key={container.id}
                center={container.position}
                radius={container.fillLevel >= COLLECTION_THRESHOLD_PERCENT ? 6 : 4}
                pathOptions={{
                  color: containerColor(container.fillLevel),
                  fillColor: containerColor(container.fillLevel),
                  fillOpacity: 0.85,
                  weight: 1,
                }}
              >
                <LeafletTooltip direction="top">
                  {container.name} · {container.fillLevel}% ممتلئة
                </LeafletTooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      {/* Per-truck route table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-1">خطة المسارات لكل مركبة</h3>
        <p className="text-sm text-muted-foreground mb-6">
          ترتيب التوقفات محسّن لكل مركبة على حدة لتقليل المسافة الكلية المقطوعة
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b-2 border-border">
                <th className="text-right p-3 font-semibold text-foreground">المركبة</th>
                <th className="text-right p-3 font-semibold text-foreground">السائق</th>
                <th className="text-right p-3 font-semibold text-foreground">المستودع</th>
                <th className="text-center p-3 font-semibold text-foreground">التوقفات</th>
                <th className="text-center p-3 font-semibold text-foreground">الحمولة</th>
                <th className="text-center p-3 font-semibold text-foreground">المسافة</th>
                <th className="text-center p-3 font-semibold text-foreground">المدة</th>
                <th className="text-center p-3 font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, index) => {
                const isExpanded = expandedTruckId === route.truck.id;
                const color = routeColor(index, routes.length);
                return (
                  <Fragment key={route.truck.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.03 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedTruckId(isExpanded ? null : route.truck.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="font-semibold text-foreground">{route.truck.id}</span>
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{route.truck.driver}</td>
                      <td className="p-3 text-sm text-muted-foreground">{route.truck.depotName}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {route.stops.length}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, route.loadPercent)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10">{route.loadPercent.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-sm text-foreground">{route.totalDistanceKm.toFixed(1)} كم</td>
                      <td className="p-3 text-center text-sm text-foreground">{Math.round(route.totalDurationMin)} د</td>
                      <td className="p-3 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground inline" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground inline" />
                        )}
                      </td>
                    </motion.tr>
                    {isExpanded && (
                      <tr className="bg-muted/20">
                        <td colSpan={8} className="p-4">
                          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {route.stops.map((stop, stopIndex) => (
                              <li
                                key={stop.container.id}
                                className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm"
                              >
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs">
                                  {stopIndex + 1}
                                </span>
                                <span className="flex-1 text-foreground">{stop.container.name}</span>
                                <span
                                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{
                                    color: containerColor(stop.container.fillLevel),
                                    background: `${containerColor(stop.container.fillLevel)}1a`,
                                  }}
                                >
                                  {stop.container.fillLevel}%
                                </span>
                              </li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {plan.unassignedContainers.length > 0 && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            {plan.unassignedContainers.length} حاوية مستحقة لم يتم تعيينها لعدم توفر سعة كافية في الأسطول الحالي.
          </div>
        )}
      </motion.div>
    </div>
  );
}
