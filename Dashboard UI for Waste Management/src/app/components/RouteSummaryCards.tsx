import { Truck, TruckIcon, MapPin, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { PLAN_MODIFICATIONS_TODAY } from '../lib/wasteFleetData';
import type { RoutingMetrics } from '../lib/wasteRoutingTypes';

interface RouteSummaryCardsProps {
  metrics: RoutingMetrics;
}

export function RouteSummaryCards({ metrics }: RouteSummaryCardsProps) {
  const cards = [
    {
      id: 1,
      title: 'عدد المركبات المتاحة',
      value: metrics.availableTrucks,
      icon: Truck,
      color: 'primary' as const,
      delay: 0,
    },
    {
      id: 2,
      title: 'عدد المركبات العاملة حالياً',
      value: metrics.trucksUsed,
      icon: TruckIcon,
      color: 'success' as const,
      delay: 0.1,
    },
    {
      id: 3,
      title: 'عدد المناطق المخدومة',
      value: 42,
      icon: MapPin,
      color: 'primary' as const,
      delay: 0.2,
    },
    {
      id: 4,
      title: 'عدد التعديلات اليوم',
      value: PLAN_MODIFICATIONS_TODAY,
      icon: RefreshCw,
      color: 'warning' as const,
      delay: 0.3,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay, duration: 0.5 }}
            className={`rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${colorStyles[card.color]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2 opacity-90">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorStyles[card.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
