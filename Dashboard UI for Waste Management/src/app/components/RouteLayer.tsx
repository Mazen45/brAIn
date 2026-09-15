import { Polyline } from 'react-leaflet';
import { Route } from './MapView';

interface RouteLayerProps {
  routes: Route[];
}

const routeStyles: Record<Route['type'], { color: string; weight: number; dashArray?: string }> = {
  normal: { color: '#1a5c3a', weight: 3 },
  modified: { color: '#3b82f6', weight: 3 },
  cancelled: { color: '#94a3b8', weight: 2, dashArray: '8,4' },
};

export function RouteLayer({ routes }: RouteLayerProps) {
  return (
    <>
      {routes.map((route) => {
        const style = routeStyles[route.type];
        return (
          <Polyline
            key={route.id}
            positions={route.points}
            interactive={false}
            pathOptions={{
              color: route.color ?? style.color,
              weight: style.weight,
              dashArray: style.dashArray,
              opacity: 0.8,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        );
      })}
    </>
  );
}
