import { Filter } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsFiltersProps {
  selectedPeriod: string;
  selectedType: string;
  onPeriodChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export function ReportsFilters({
  selectedPeriod,
  selectedType,
  onPeriodChange,
  onTypeChange,
}: ReportsFiltersProps) {
  const periods = [
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'quarter', label: 'هذا الربع' },
    { value: 'year', label: 'هذا العام' },
  ];

  const types = [
    { value: 'all', label: 'جميع التعديلات' },
    { value: 'driver', label: 'غياب سائق' },
    { value: 'vehicle', label: 'عطل مركبة' },
    { value: 'redistribution', label: 'إعادة توزيع' },
    { value: 'delay', label: 'تأخير' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-card rounded-xl border-2 border-border p-5 shadow-md"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Filter className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold">تصفية البيانات</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            تصفية حسب الفترة الزمنية
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            تصفية حسب نوع التعديل
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}
