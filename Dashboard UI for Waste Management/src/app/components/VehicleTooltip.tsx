import { X, Truck, User, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from './MapView';
import { useEffect, useRef } from 'react';

interface VehicleTooltipProps {
  vehicle: Vehicle;
  position: { x: number; y: number };
  onClose: () => void;
}

export function VehicleTooltip({ vehicle, position, onClose }: VehicleTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const isActive = vehicle.status === 'active';

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="fixed bg-card border-2 border-border rounded-xl shadow-2xl p-4"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 10}px`,
        transform: 'translate(-50%, -100%)',
        minWidth: '280px',
        direction: 'rtl',
        zIndex: 1200,
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${isActive ? 'bg-success/10' : 'bg-muted-foreground/10'}
          `}
        >
          <Truck className={`w-5 h-5 ${isActive ? 'text-success' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">مركبة {vehicle.id}</h4>
          <p
            className={`text-sm font-medium mt-0.5 ${
              isActive ? 'text-success' : 'text-muted-foreground'
            }`}
          >
            {isActive ? 'نشط' : 'غير متاح'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
          <User className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">السائق:</p>
            <p className="text-sm font-semibold text-foreground">{vehicle.driver}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
          <Navigation className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">المسار الحالي:</p>
            <p className="text-sm font-semibold text-foreground">{vehicle.route}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
