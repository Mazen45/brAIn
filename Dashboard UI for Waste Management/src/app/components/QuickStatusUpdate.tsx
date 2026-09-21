import { useState } from 'react';
import { Edit, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import type { Truck } from '../lib/wasteRoutingTypes';

interface QuickStatusUpdateProps {
  trucks: Truck[];
  onUpdateDriverAvailability: (truckId: string, available: boolean, reason?: string) => void;
  onUpdateVehicleStatus: (truckId: string, status: Truck['status']) => void;
}

const DRIVER_STATUSES = [
  { value: 'available', label: 'متاح' },
  { value: 'unavailable', label: 'غير متاح (غياب)' },
] as const;

const VEHICLE_STATUSES = [
  { value: 'available', label: 'تعمل' },
  { value: 'maintenance', label: 'قيد الصيانة' },
] as const;

export function QuickStatusUpdate({ trucks, onUpdateDriverAvailability, onUpdateVehicleStatus }: QuickStatusUpdateProps) {
  const [selectedDriverTruckId, setSelectedDriverTruckId] = useState('');
  const [driverStatus, setDriverStatus] = useState('');
  const [selectedVehicleTruckId, setSelectedVehicleTruckId] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('');
  const [reason, setReason] = useState('');

  const { message, showToast } = useToast();

  const handleSave = () => {
    let updated = false;

    if (selectedDriverTruckId && driverStatus) {
      onUpdateDriverAvailability(
        selectedDriverTruckId,
        driverStatus === 'available',
        driverStatus === 'unavailable' ? reason || undefined : undefined
      );
      updated = true;
    }

    if (selectedVehicleTruckId && vehicleStatus) {
      onUpdateVehicleStatus(selectedVehicleTruckId, vehicleStatus as Truck['status']);
      updated = true;
    }

    if (!updated) {
      showToast('يرجى اختيار سائق أو مركبة وحالتها الجديدة أولاً');
      return;
    }

    showToast('تم حفظ التحديث بنجاح');
    setSelectedDriverTruckId('');
    setDriverStatus('');
    setSelectedVehicleTruckId('');
    setVehicleStatus('');
    setReason('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-6 shadow-lg"
    >
      <Toast message={message} />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Edit className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">تحديث سريع للحالة</h3>
          <p className="text-sm text-muted-foreground">تحديث حالة السائقين والمركبات بسرعة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver Update */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">تحديث حالة السائق</h4>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              اختر السائق
            </label>
            <select
              value={selectedDriverTruckId}
              onChange={(e) => setSelectedDriverTruckId(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
            >
              <option value="">-- اختر السائق --</option>
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.driver} ({truck.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              الحالة الجديدة
            </label>
            <select
              value={driverStatus}
              onChange={(e) => setDriverStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
            >
              <option value="">-- اختر الحالة --</option>
              {DRIVER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Update */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">تحديث حالة المركبة</h4>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              اختر المركبة
            </label>
            <select
              value={selectedVehicleTruckId}
              onChange={(e) => setSelectedVehicleTruckId(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
            >
              <option value="">-- اختر المركبة --</option>
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.id} - {truck.driver}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              الحالة الجديدة
            </label>
            <select
              value={vehicleStatus}
              onChange={(e) => setVehicleStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
            >
              <option value="">-- اختر الحالة --</option>
              {VEHICLE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reason Field - applies to driver absence, shown in the drivers table */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          سبب غياب السائق (اختياري)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثال: إجازة، ظرف طارئ..."
          className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span className="font-medium">حفظ التحديث</span>
        </button>
      </div>
    </motion.div>
  );
}
