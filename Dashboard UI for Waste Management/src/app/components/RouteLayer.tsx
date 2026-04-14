import { motion } from 'motion/react';
import { Route } from './MapView';

interface RouteLayerProps {
  routes: Route[];
}

export function RouteLayer({ routes }: RouteLayerProps) {
  const routeStyles = {
    normal: {
      stroke: '#1a5c3a',
      strokeWidth: 3,
      strokeDasharray: '0',
    },
    modified: {
      stroke: '#3b82f6',
      strokeWidth: 3,
      strokeDasharray: '0',
    },
    cancelled: {
      stroke: '#94a3b8',
      strokeWidth: 2,
      strokeDasharray: '8,4',
    },
  };

  return (
    <g>
      {routes.map((route, index) => {
        const style = routeStyles[route.type];
        const pathData = route.points
          .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
          .join(' ');

        return (
          <motion.path
            key={route.id}
            d={pathData}
            fill="none"
            stroke={style.stroke}
            strokeWidth={style.strokeWidth}
            strokeDasharray={style.strokeDasharray}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 1.5, delay: index * 0.2, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
    </g>
  );
}
