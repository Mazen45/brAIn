import { CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import { COLLECTION_THRESHOLD_PERCENT, OVERFLOW_RISK_PERCENT } from '../lib/smartRouting';
import { WasteContainer } from '../lib/wasteRoutingTypes';

export function containerColor(fillLevel: number): string {
  if (fillLevel >= OVERFLOW_RISK_PERCENT) return '#dc2626';
  if (fillLevel >= COLLECTION_THRESHOLD_PERCENT) return '#f59e0b';
  return '#10b981';
}

interface WasteContainerMarkerProps {
  container: WasteContainer;
}

export function WasteContainerMarker({ container }: WasteContainerMarkerProps) {
  const color = containerColor(container.fillLevel);
  const isDue = container.fillLevel >= COLLECTION_THRESHOLD_PERCENT;

  return (
    <CircleMarker
      center={container.position}
      radius={isDue ? 6 : 4}
      pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 1 }}
    >
      <LeafletTooltip direction="top">
        {container.name} · {container.fillLevel}% ممتلئة
      </LeafletTooltip>
    </CircleMarker>
  );
}
