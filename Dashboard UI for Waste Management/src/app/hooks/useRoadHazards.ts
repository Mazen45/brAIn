import { useCallback, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../lib/persistence';
import type { RoadHazard } from '../lib/roadHazards';
import type { LatLng } from '../lib/wasteRoutingTypes';

export interface NewRoadHazardInput {
  label: string;
  position: LatLng;
  radiusKm: number;
}

export interface RoadHazardsState {
  hazards: RoadHazard[];
  addHazard: (input: NewRoadHazardInput) => void;
  removeHazard: (id: string) => void;
  toggleHazardActive: (id: string) => void;
}

/**
 * Dispatcher-marked road closures, persisted locally and applied on top of
 * the routing engine's distance metric (see roadHazards.ts /
 * useSmartRoutingPlan) so the optimizer steers assignments away from them.
 * Kept separate from the demo/custom fleet-data toggle - road conditions are
 * a fact about the real world right now, independent of which dataset is
 * being planned against.
 */
export function useRoadHazards(): RoadHazardsState {
  const [hazards, setHazardsState] = useState<RoadHazard[]>(() => loadFromStorage('hazards', [] as RoadHazard[]));

  const persist = useCallback((next: RoadHazard[]) => {
    setHazardsState(next);
    saveToStorage('hazards', next);
  }, []);

  const addHazard = useCallback(
    (input: NewRoadHazardInput) => {
      const hazard: RoadHazard = {
        id: `H-${Date.now()}`,
        active: true,
        createdAt: Date.now(),
        ...input,
      };
      persist([...hazards, hazard]);
    },
    [hazards, persist]
  );

  const removeHazard = useCallback(
    (id: string) => {
      persist(hazards.filter((h) => h.id !== id));
    },
    [hazards, persist]
  );

  const toggleHazardActive = useCallback(
    (id: string) => {
      persist(hazards.map((h) => (h.id === id ? { ...h, active: !h.active } : h)));
    },
    [hazards, persist]
  );

  return { hazards, addHazard, removeHazard, toggleHazardActive };
}
