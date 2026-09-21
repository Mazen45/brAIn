import { UserCheck, UserX, Truck, WrenchIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { RoutingMetrics } from '../lib/wasteRoutingTypes';

interface DriversVehiclesSummaryProps {
  metrics: RoutingMetrics;
}

// Driver absence and vehicle maintenance are independent real facts (see
// QuickStatusUpdate/Truck.driverAvailable) - a driver can be out while their
// truck is fine, or the reverse - so they're tracked and shown separately
// instead of assuming one always implies the other.
export function DriversVehiclesSummary({ metrics }: DriversVehiclesSummaryProps) {
  const cards = [
    {
      id: 1,
      title: 'السائقين المتاحين',
      value: metrics.availableTrucks,
      icon: UserCheck,
      color: 'success' as const,
      delay: 0,
    },
    {
      id: 2,
      title: 'السائقين غير المتاحين',
      value: metrics.driversUnavailable,
      icon: UserX,
      color: 'muted' as const,
      delay: 0.1,
    },
    {
      id: 3,
      title: 'المركبات العاملة',
      value: metrics.trucksUsed,
      icon: Truck,
      color: 'success' as const,
      delay: 0.2,
    },
    {
      id: 4,
      title: 'المركبات خارج الخدمة',
      value: metrics.vehiclesOutOfService,
      icon: WrenchIcon,
      color: 'destructive' as const,
      delay: 0.3,
    },
  ];

  const colorStyles = {
    success: 'bg-success/10 border-success/30 text-success',
    muted: 'bg-muted border-border text-muted-foreground',
    destructive: 'bg-destructive/10 border-destructive/30 text-destructive',
  };

  const iconColorStyles = {
    success: 'bg-success/20 text-success',
    muted: 'bg-muted-foreground/20 text-muted-foreground',
    destructive: 'bg-destructive/20 text-destructive',
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
            className={`rounded-xl border-2 p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colorStyles[card.color]}`}
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
