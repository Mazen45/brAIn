import { RefreshCw, Filter, MapPin, Truck, Navigation, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface MapControlsProps {
  showZones: boolean;
  showVehicles: boolean;
  showRoutes: boolean;
  onToggleZones: () => void;
  onToggleVehicles: () => void;
  onToggleRoutes: () => void;
  onOpenUpdates: () => void;
}

export function MapControls({
  showZones,
  showVehicles,
  showRoutes,
  onToggleZones,
  onToggleVehicles,
  onToggleRoutes,
  onOpenUpdates,
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg">
          <RefreshCw className="w-4 h-4" />
          <span className="font-medium">إعادة توليد الخطة</span>
        </button>

        <button
          onClick={onOpenUpdates}
          className="flex items-center gap-2 px-4 py-2.5 bg-card text-foreground border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Clock className="w-4 h-4" />
          <span className="font-medium">آخر التحديثات</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground ml-2">تصفية العرض:</span>

        <button
          onClick={onToggleZones}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
            ${showZones
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
            }
          `}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">المناطق</span>
        </button>

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
      </div>
    </motion.div>
  );
}
