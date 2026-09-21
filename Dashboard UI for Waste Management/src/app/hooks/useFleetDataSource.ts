import { useCallback, useMemo, useState } from 'react';
import { generateMockContainers, generateMockTrucks } from '../lib/wasteFleetData';
import { Truck, WasteContainer } from '../lib/wasteRoutingTypes';
import {
  CustomContainer,
  CustomDepot,
  CustomTruck,
  customContainersToContainers,
  customTrucksToTrucks,
} from '../lib/customFleetData';
import { loadFromStorage, saveToStorage } from '../lib/persistence';

export type FleetDataMode = 'demo' | 'custom';

interface TruckStatusOverride {
  status?: Truck['status'];
  driverAvailable?: boolean;
  unavailabilityReason?: string;
}

export interface FleetDataSource {
  mode: FleetDataMode;
  setMode: (mode: FleetDataMode) => void;
  /** Trucks/containers actually fed to the routing engine - demo-generated or converted from the real entered data, depending on mode, with any live status updates from setTruckStatus/setDriverAvailability applied on top. */
  trucks: Truck[];
  containers: WasteContainer[];
  depots: CustomDepot[];
  customTrucks: CustomTruck[];
  customContainers: CustomContainer[];
  setDepots: (depots: CustomDepot[]) => void;
  setCustomTrucks: (trucks: CustomTruck[]) => void;
  setCustomContainers: (containers: CustomContainer[]) => void;
  /** Reshuffles the demo dataset with a new random seed. No-op in custom mode - there's nothing "random" to reshuffle in real data. */
  regenerateDemo: () => void;
  /** Updates a truck's mechanical status (available/maintenance) - e.g. from the drivers & vehicles page's quick status update. Persists and takes effect immediately across the whole app. */
  setTruckStatus: (truckId: string, status: Truck['status']) => void;
  /** Updates whether a truck's driver is present today, independent of the vehicle's own status, with an optional reason shown in the drivers table. */
  setDriverAvailability: (truckId: string, available: boolean, reason?: string) => void;
}

/**
 * The single source of "which trucks and containers exist" for the whole
 * app - either the procedurally-generated demo fleet, or the municipality's
 * own entered/imported depots, trucks and containers (persisted locally via
 * customFleetData.ts + persistence.ts). Everything downstream (routing,
 * map, reports) consumes the same Truck[]/WasteContainer[] shape either way.
 */
export function useFleetDataSource(): FleetDataSource {
  const [mode, setModeState] = useState<FleetDataMode>(() => loadFromStorage<FleetDataMode>('mode', 'demo'));
  const [seedTick, setSeedTick] = useState(0);
  const [depots, setDepotsState] = useState<CustomDepot[]>(() => loadFromStorage('depots', [] as CustomDepot[]));
  const [customTrucks, setCustomTrucksState] = useState<CustomTruck[]>(() =>
    loadFromStorage('trucks', [] as CustomTruck[])
  );
  const [customContainers, setCustomContainersState] = useState<CustomContainer[]>(() =>
    loadFromStorage('containers', [] as CustomContainer[])
  );
  // Keyed by "<mode>:<truckId>" so a status set while in demo mode never
  // leaks onto an unrelated custom truck that happens to reuse the same id
  // (e.g. a CSV import that didn't specify explicit ids), and vice versa.
  const [statusOverrides, setStatusOverridesState] = useState<Record<string, TruckStatusOverride>>(() =>
    loadFromStorage('truckStatusOverrides', {} as Record<string, TruckStatusOverride>)
  );

  const setMode = useCallback((next: FleetDataMode) => {
    setModeState(next);
    saveToStorage('mode', next);
  }, []);

  const setDepots = useCallback((next: CustomDepot[]) => {
    setDepotsState(next);
    saveToStorage('depots', next);
  }, []);

  const setCustomTrucks = useCallback((next: CustomTruck[]) => {
    setCustomTrucksState(next);
    saveToStorage('trucks', next);
  }, []);

  const setCustomContainers = useCallback((next: CustomContainer[]) => {
    setCustomContainersState(next);
    saveToStorage('containers', next);
  }, []);

  const demoTrucks = useMemo(() => generateMockTrucks(1 + seedTick * 13), [seedTick]);
  const demoContainers = useMemo(() => generateMockContainers(2 + seedTick * 29), [seedTick]);

  const baseTrucks = useMemo(
    () => (mode === 'demo' ? demoTrucks : customTrucksToTrucks(customTrucks, depots)),
    [mode, demoTrucks, customTrucks, depots]
  );

  // Live status updates (from the drivers & vehicles page) apply on top of
  // whichever base fleet is active, so a manually-marked absence/maintenance
  // survives a demo regenerate (truck ids are stable, T01..T20 regardless of
  // seed) and is never lost just because the underlying data recomputed.
  const trucks = useMemo(
    () =>
      baseTrucks.map((truck) => {
        const override = statusOverrides[`${mode}:${truck.id}`];
        return override ? { ...truck, ...override } : truck;
      }),
    [baseTrucks, statusOverrides, mode]
  );

  const containers = useMemo(
    () => (mode === 'demo' ? demoContainers : customContainersToContainers(customContainers)),
    [mode, demoContainers, customContainers]
  );

  const regenerateDemo = useCallback(() => setSeedTick((t) => t + 1), []);

  const setOverride = useCallback(
    (truckId: string, patch: TruckStatusOverride) => {
      const key = `${mode}:${truckId}`;
      const next = { ...statusOverrides, [key]: { ...statusOverrides[key], ...patch } };
      setStatusOverridesState(next);
      saveToStorage('truckStatusOverrides', next);
    },
    [mode, statusOverrides]
  );

  const setTruckStatus = useCallback(
    (truckId: string, status: Truck['status']) => setOverride(truckId, { status }),
    [setOverride]
  );

  const setDriverAvailability = useCallback(
    (truckId: string, available: boolean, reason?: string) =>
      setOverride(truckId, {
        driverAvailable: available,
        unavailabilityReason: available ? undefined : reason,
      }),
    [setOverride]
  );

  return {
    mode,
    setMode,
    trucks,
    containers,
    depots,
    customTrucks,
    customContainers,
    setDepots,
    setCustomTrucks,
    setCustomContainers,
    regenerateDemo,
    setTruckStatus,
    setDriverAvailability,
  };
}
