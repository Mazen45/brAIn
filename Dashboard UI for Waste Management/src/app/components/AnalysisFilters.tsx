import { Filter } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisFiltersProps {
  selectedLevel: string;
  selectedResources: string;
  onLevelChange: (value: string) => void;
  onResourcesChange: (value: string) => void;
}

export function AnalysisFilters({
  selectedLevel,
  selectedResources,
  onLevelChange,
  onResourcesChange,
}: AnalysisFiltersProps) {
  const levels = [
    { value: 'all', label: 'جميع المستويات' },
    { value: 'normal', label: 'طبيعي' },
    { value: 'medium', label: 'متوسط' },
    { value: 'critical', label: 'حرج' },
  ];

  const resources = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'sufficient', label: 'موارد كافية' },
    { value: 'shortage', label: 'نقص في الموارد' },
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
        {/* Level Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            تصفية حسب مستوى التراكم
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
          >
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Resources Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            تصفية حسب حالة الموارد
          </label>
          <select
            value={selectedResources}
            onChange={(e) => onResourcesChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-input-background border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors text-foreground"
          >
            {resources.map((resource) => (
              <option key={resource.value} value={resource.value}>
                {resource.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}
