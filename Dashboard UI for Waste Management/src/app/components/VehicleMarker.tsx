import { useMemo } from 'react';
import L from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { Marker } from 'react-leaflet';
import { Vehicle } from './MapView';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  onClick: (e: LeafletMouseEvent) => void;
  zIndexOffset?: number;
}

export function VehicleMarker({ vehicle, onClick, zIndexOffset }: VehicleMarkerProps) {
  const isActive = vehicle.status === 'active';
  const label = vehicle.id;
  const color = isActive ? vehicle.color : undefined;
  const colorStyle = color ? ` style="background:${color}"` : '';

  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'vehicle-div-icon',
        html: `
          <div class="vehicle-pin ${isActive ? 'vehicle-pin--active' : 'vehicle-pin--inactive'}"${colorStyle}>
            ${isActive ? `<span class="vehicle-pin__pulse"${colorStyle}></span>` : ''}
            <span class="vehicle-pin__icon">🚚</span>
          </div>
          <div class="vehicle-pin__badge ${isActive ? 'vehicle-pin__badge--active' : 'vehicle-pin__badge--inactive'}"${colorStyle}>${label}</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [isActive, label, colorStyle]
  );

  return (
    <Marker
      position={vehicle.position}
      icon={icon}
      zIndexOffset={zIndexOffset}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation();
          onClick(e);
        },
      }}
    />
  );
}
