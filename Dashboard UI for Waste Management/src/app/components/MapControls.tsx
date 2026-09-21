import { RefreshCw, Truck, Navigation, Clock, Recycle, Construction, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { RouteVehicleFilter } from './RouteVehicleFilter';
import type { Route } from './MapView';

interface MapControlsProps {
  showVehicles: boolean;
  showRoutes: boolean;
  showContainers: boolean;
  showHeatmap: boolean;
  onToggleVehicles: () => void;
  onToggleRoutes: () => void;
  onToggleContainers: () => void;
  onToggleHeatmap: () => void;
  onOpenUpdates: () => void;
  onRegenerateRoutes: () => void;
  isRegeneratingRoutes: boolean;
  isAddHazardMode: boolean;
  onToggleAddHazardMode: () => void;
  routes: Route[];
  visibleRouteTruckIds: Set<string> | null;
  onVisibleRouteTruckIdsChange: (next: Set<string> | null) => void;
}

export function MapControls({
  showVehicles,
  showRoutes,
  showContainers,
  showHeatmap,
  onToggleVehicles,
  onToggleRoutes,
  onToggleContainers,
  onToggleHeatmap,
  onOpenUpdates,
  onRegenerateRoutes,
  isRegeneratingRoutes,
  isAddHazardMode,
  onToggleAddHazardMode,
  routes,
  visibleRouteTruckIds,
  onVisibleRouteTruckIdsChange,
}: MapControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-b border-border p-4 flex flex-wrap items-center justify-between gap-4"
      dir="rtl"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onRegenerateRoutes}
          disabled={isRegeneratingRoutes}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRegeneratingRoutes ? 'animate-spin' : ''}`} />
          <span className="font-medium">{isRegeneratingRoutes ? 'جارٍ إعادة الحساب...' : 'إعادة توليد الخطة'}</span>
        </button>

        <button
          onClick={onOpenUpdates}
          className="flex items-center gap-2 px-4 py-2.5 bg-card text-foreground border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Clock className="w-4 h-4" />
          <span className="font-medium">آخر التحديثات</span>
        </button>

        <button
          onClick={onToggleAddHazardMode}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
            isAddHazardMode
              ? 'bg-destructive/10 border-destructive text-destructive'
              : 'bg-card text-foreground border-border hover:border-destructive/40'
          }`}
        >
          <Construction className="w-4 h-4" />
          <span className="font-medium">
            {isAddHazardMode ? 'انقر على الخريطة لتحديد الموقع...' : 'إغلاق طريق'}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground ml-2">تصفية العرض:</span>

        <button
          onClick={onToggleVehicles}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
            ${showVehicles
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
            }
          `}
        >
          <Truck className="w-4 h-4" />
          <span className="text-sm font-medium">المركبات</span>
        </button>

        <button
          onClick={onToggleRoutes}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
            ${showRoutes
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
            }
          `}
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm font-medium">المسارات</span>
        </button>

        {showRoutes && (
          <RouteVehicleFilter
            routes={routes}
            visibleTruckIds={visibleRouteTruckIds}
            onChange={onVisibleRouteTruckIdsChange}
          />
        )}

        <button
          onClick={onToggleContainers}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
            ${showContainers
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
            }
          `}
        >
          <Recycle className="w-4 h-4" />
          <span className="text-sm font-medium">الحاويات</span>
        </button>

        <button
          onClick={onToggleHeatmap}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
            ${showHeatmap
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
            }
          `}
        >
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">خريطة الكثافة الحرارية</span>
        </button>
      </div>
    </motion.div>
  );
}
