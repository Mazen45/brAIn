import { useState } from 'react';
import { Edit, Save } from 'lucide-react';
import { motion } from 'motion/react';

export function QuickStatusUpdate() {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [driverStatus, setDriverStatus] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('');
  const [reason, setReason] = useState('');

  const drivers = [
    'أحمد محمد',
    'سارة أحمد',
    'محمد علي',
    'فاطمة حسن',
    'خالد يوسف',
  ];

  const vehicles = [
    'مركبة 1',
    'مركبة 2',
    'مركبة 3',
    'مركبة 4',
    'مركبة 5',
  ];

  const statuses = [
    { value: 'available', label: 'متاح' },
    { value: 'unavailable', label: 'غير متاح' },
    { value: 'on-duty', label: 'في مهمة' },
    { value: 'stopped', label: 'متوقف' },
  ];

  const handleSave = () => {
    alert('تم حفظ التحديث بنجاح');
    // Reset form
    setSelectedDriver('');
    setDriverStatus('');
    setSelectedVehicle('');
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
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
            >
              <option value="">-- اختر السائق --</option>
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
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
              {statuses.map((status) => (
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
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
            >
              <option value="">-- اختر المركبة --</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
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
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reason Field */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          سبب الحالة (اختياري)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثال: إجازة، عطل، صيانة..."
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
