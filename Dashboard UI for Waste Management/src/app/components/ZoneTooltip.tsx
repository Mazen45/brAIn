import { X, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Zone } from './MapView';
import { useEffect, useRef } from 'react';

interface ZoneTooltipProps {
  zone: Zone;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ZoneTooltip({ zone, position, onClose }: ZoneTooltipProps) {
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

  const statusLabels = {
    normal: { text: 'طبيعي', color: 'text-success' },
    attention: { text: 'بحاجة متابعة', color: 'text-warning' },
    critical: { text: 'حرج', color: 'text-destructive' },
  };

  const status = statusLabels[zone.status];

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
        zIndex: 30,
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
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{zone.name}</h4>
          <p className={`text-sm font-medium mt-0.5 ${status.color}`}>{status.text}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">مستوى التراكم:</span>
          <span className="text-sm font-semibold text-foreground">{zone.level}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">عدد البلاغات:</span>
          <span className="text-sm font-semibold text-foreground">{zone.reports}</span>
        </div>

        {/* Redistribution Info */}
        {zone.redistributed && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">تم إعادة التوزيع</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span>{zone.fromVehicle}</span>
              <ArrowRight className="w-4 h-4" />
              <span>{zone.toVehicle}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
