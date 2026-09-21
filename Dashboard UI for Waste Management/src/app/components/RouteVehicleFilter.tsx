import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ListFilter } from 'lucide-react';
import { routeColor } from '../lib/routeColors';
import type { Route } from './MapView';

interface RouteOption {
  id: string;
  label: string;
  color: string;
}

interface RouteVehicleFilterProps {
  routes: Route[];
  /** null = no filter, show every route. A Set restricts display to just those truck ids. */
  visibleTruckIds: Set<string> | null;
  onChange: (next: Set<string> | null) => void;
}

export function RouteVehicleFilter({ routes, visibleTruckIds, onChange }: RouteVehicleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: RouteOption[] = routes.map((route, i) => ({
    id: route.id,
    label: route.id,
    color: route.color ?? routeColor(i, routes.length),
  }));

  const isChecked = (truckId: string) => visibleTruckIds === null || visibleTruckIds.has(truckId);
  const filteredCount = visibleTruckIds === null ? options.length : visibleTruckIds.size;

  const toggle = (truckId: string) => {
    const base = visibleTruckIds === null ? new Set(options.map((o) => o.id)) : new Set(visibleTruckIds);
    if (base.has(truckId)) base.delete(truckId);
    else base.add(truckId);
    onChange(base);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
          visibleTruckIds !== null
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-card text-foreground border-border hover:border-primary/30'
        }`}
      >
        <ListFilter className="w-4 h-4" />
        <span className="font-medium">
          {visibleTruckIds === null ? 'كل المسارات' : `${filteredCount} من ${options.length} مسار`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Layer 1150+ - above the map's own overlays (QuickDetailsPanel/
                MapLegend sit at 1100), since this is a transient menu that
                must float above them while open, not fight for the same layer. */}
            <div className="fixed inset-0" style={{ zIndex: 1150 }} onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden w-64"
              style={{ zIndex: 1160 }}
              dir="rtl"
            >
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <button
                  onClick={() => onChange(null)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  إظهار الكل
                </button>
                <button
                  onClick={() => onChange(new Set())}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
                >
                  إخفاء الكل
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto p-2">
                {options.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد مسارات لعرضها</p>
                ) : (
                  options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked(option.id)}
                        onChange={() => toggle(option.id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: option.color }} />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
