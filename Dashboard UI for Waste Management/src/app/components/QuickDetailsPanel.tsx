import { MapPin, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickDetailsPanelProps {
  criticalZones: number;
  activeVehicles: number;
  modifications: number;
}

export function QuickDetailsPanel({ criticalZones, activeVehicles, modifications }: QuickDetailsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="absolute top-6 left-6 bg-card/95 backdrop-blur-sm border-2 border-border rounded-xl p-5 shadow-xl min-w-[240px]"
      style={{ zIndex: 10 }}
      dir="rtl"
    >
      <h4 className="font-semibold mb-4 text-primary">تفاصيل فورية</h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm font-medium">مناطق حرجة</span>
          </div>
          <span className="text-2xl font-bold text-destructive">{criticalZones}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm font-medium">مركبات نشطة</span>
          </div>
          <span className="text-2xl font-bold text-success">{activeVehicles}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium">تعديلات اليوم</span>
          </div>
          <span className="text-2xl font-bold text-primary">{modifications}</span>
        </div>
      </div>
    </motion.div>
  );
}
