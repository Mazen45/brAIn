import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { WasteContainer } from '../lib/wasteRoutingTypes';

interface HeatmapLayerProps {
  containers: WasteContainer[];
}

/**
 * Renders a density heatmap over the waste containers, weighted by each
 * container's current estimated volume (capacity * fill level) rather than
 * just its fill percentage - a full 1100L container contributes far more to
 * an area's actual waste production than a full 240L one. This is what makes
 * the hot spots read as "where waste is piling up the most" instead of just
 * "where containers happen to be clustered".
 */
export function HeatmapLayer({ containers }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (containers.length === 0) return;

    const weights = containers.map((c) => (c.fillLevel / 100) * c.capacityL);
    const maxWeight = Math.max(...weights, 1);

    const points: [number, number, number][] = containers.map((c, i) => [
      c.position[0],
      c.position[1],
      weights[i] / maxWeight,
    ]);

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 18,
      minOpacity: 0.35,
      gradient: {
        0.0: '#10b981',
        0.5: '#f59e0b',
        1.0: '#dc2626',
      },
    }).addTo(map);

    return () => {
      heat.remove();
    };
  }, [map, containers]);

  return null;
}
