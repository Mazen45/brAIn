import { motion } from 'motion/react';
import { Zone } from './MapView';

interface MapZoneProps {
  zone: Zone;
  onClick: (e: React.MouseEvent) => void;
}

export function MapZone({ zone, onClick }: MapZoneProps) {
  const statusColors = {
    normal: {
      fill: 'rgba(16, 185, 129, 0.2)',
      stroke: 'rgba(16, 185, 129, 0.5)',
      hoverFill: 'rgba(16, 185, 129, 0.3)',
    },
    attention: {
      fill: 'rgba(245, 158, 11, 0.2)',
      stroke: 'rgba(245, 158, 11, 0.5)',
      hoverFill: 'rgba(245, 158, 11, 0.3)',
    },
    critical: {
      fill: 'rgba(220, 38, 38, 0.2)',
      stroke: 'rgba(220, 38, 38, 0.5)',
      hoverFill: 'rgba(220, 38, 38, 0.3)',
    },
  };

  const colors = statusColors[zone.status];

  return (
    <g>
      {/* Zone Rectangle */}
      <motion.rect
        x={`${zone.position.x}%`}
        y={`${zone.position.y}%`}
        width={`${zone.position.width}%`}
        height={`${zone.position.height}%`}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="2"
        rx="8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
        whileHover={{
          fill: colors.hoverFill,
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Redistribution Indicator */}
      {zone.redistributed && (
        <>
          {/* Glow Effect */}
          <motion.rect
            x={`${zone.position.x}%`}
            y={`${zone.position.y}%`}
            width={`${zone.position.width}%`}
            height={`${zone.position.height}%`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            rx="8"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ pointerEvents: 'none' }}
          />

          {/* Redistribution Badge */}
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <rect
              x={`${zone.position.x + zone.position.width / 2 - 4.5}%`}
              y={`${zone.position.y - 2}%`}
              width="9%"
              height="3%"
              fill="#3b82f6"
              rx="4"
            />
            <text
              x={`${zone.position.x + zone.position.width / 2}%`}
              y={`${zone.position.y - 0.5}%`}
              textAnchor="middle"
              fill="white"
              fontSize="9"
              fontWeight="600"
            >
              تمت إعادة التوزيع
            </text>
          </motion.g>
        </>
      )}

      {/* Zone Label */}
      <text
        x={`${zone.position.x + zone.position.width / 2}%`}
        y={`${zone.position.y + zone.position.height / 2}%`}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1f2937"
        fontSize="14"
        fontWeight="600"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {zone.name}
      </text>
    </g>
  );
}
