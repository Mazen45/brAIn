import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import type { NewRoadHazardInput } from '../hooks/useRoadHazards';
import type { LatLng } from '../lib/wasteRoutingTypes';

// Fixed, deliberately small closure radius - narrow enough to represent a
// single blocked street rather than a whole neighborhood, and validated
// against the live routing service to actually produce a working detour in
// the common case (see roadHazards.ts's corrective-detour logic).
const FIXED_HAZARD_RADIUS_KM = 0.15;

interface AddHazardFormProps {
  position: LatLng;
  onSubmit: (input: NewRoadHazardInput) => void;
  onCancel: () => void;
}

export function AddHazardForm({ position, onSubmit, onCancel }: AddHazardFormProps) {
  const [label, setLabel] = useState('');

  const handleSubmit = () => {
    if (!label.trim()) return;
    onSubmit({
      label: label.trim(),
      position,
      radiusKm: FIXED_HAZARD_RADIUS_KM,
    });
    setLabel('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-4 right-1/2 translate-x-1/2 bg-card border-2 border-border rounded-xl shadow-2xl p-4 w-[300px]"
      style={{ zIndex: 1100 }}
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-foreground">🚧 إضافة إغلاق طريق</h4>
        <button onClick={onCancel} className="p-1 hover:bg-muted rounded">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-mono" dir="ltr">
        {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </p>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="السبب (مثال: أعمال إنشائية في شارع الملك)"
        className="w-full px-3 py-2 mb-3 bg-input-background border-2 border-border rounded-lg text-sm focus:outline-none focus:border-primary"
      />

      <button
        onClick={handleSubmit}
        disabled={!label.trim()}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        تأكيد الإضافة على الموقع المحدد
      </button>
    </motion.div>
  );
}
