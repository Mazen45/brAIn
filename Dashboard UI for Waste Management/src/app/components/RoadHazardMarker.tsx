import { Circle, Marker, Popup } from 'react-leaflet';
import { closureIcon } from '../lib/mapIcons';
import type { RoadHazard } from '../lib/roadHazards';

interface RoadHazardMarkerProps {
  hazard: RoadHazard;
  onToggleActive: (id: string) => void;
  onRemove: (id: string) => void;
}

export function RoadHazardMarker({ hazard, onToggleActive, onRemove }: RoadHazardMarkerProps) {
  const color = '#dc2626';

  return (
    <>
      <Circle
        center={hazard.position}
        radius={hazard.radiusKm * 1000}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: hazard.active ? 0.12 : 0.04,
          opacity: hazard.active ? 0.6 : 0.25,
          weight: 1.5,
        }}
        interactive={false}
      />
      <Marker position={hazard.position} icon={closureIcon} opacity={hazard.active ? 1 : 0.5}>
        <Popup>
          <div dir="rtl" style={{ minWidth: 180, fontFamily: 'inherit' }}>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>🚧 إغلاق طريق</p>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>{hazard.label}</p>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
              نطاق التأثير: {hazard.radiusKm.toFixed(1)} كم · الحالة: {hazard.active ? 'مفعّل' : 'موقوف مؤقتاً'}
            </p>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 10, fontFamily: 'monospace' }} dir="ltr">
              {hazard.position[0].toFixed(6)}, {hazard.position[1].toFixed(6)}
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => onToggleActive(hazard.id)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                }}
              >
                {hazard.active ? 'إيقاف مؤقت' : 'إعادة تفعيل'}
              </button>
              <button
                onClick={() => onRemove(hazard.id)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #dc2626',
                  background: '#fef2f2',
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
              >
                حذف
              </button>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
