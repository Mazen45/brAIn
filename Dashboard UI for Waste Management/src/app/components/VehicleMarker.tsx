import { Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle } from './MapView';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  onClick: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function VehicleMarker({ vehicle, onClick, style }: VehicleMarkerProps) {
  const isActive = vehicle.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.4 }}
      whileHover={{ scale: 1.2 }}
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{
        left: `${vehicle.position.x}%`,
        top: `${vehicle.position.y}%`,
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    >
      {/* Vehicle Icon Container */}
      <div
        className={`
          relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg
          ${isActive ? 'bg-success' : 'bg-muted-foreground'}
        `}
      >
        <Truck className="w-5 h-5 text-white" />

        {/* Active Pulse Effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-success"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: 1.5,
              opacity: 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </div>

      {/* Vehicle ID Badge */}
      <div
        className={`
          absolute -bottom-2 left-1/2 transform -translate-x-1/2
          px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md
          ${isActive ? 'bg-success text-white' : 'bg-muted-foreground text-white'}
        `}
      >
        {vehicle.id.replace('v', 'م')}
      </div>
    </motion.div>
  );
}
