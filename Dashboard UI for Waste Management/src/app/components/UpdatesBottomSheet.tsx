import { X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SystemUpdate {
  id: number;
  text: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}

// Shared with the Alerts page, so both surfaces show the same events instead
// of maintaining two separate lists that can drift apart.
export const SYSTEM_UPDATES: SystemUpdate[] = [
  {
    id: 1,
    text: 'تم إعادة توزيع حاويات مركبة 3 إلى مركبة 1',
    time: 'منذ 5 دقائق',
    type: 'info',
  },
  {
    id: 2,
    text: 'السائق محمد علي غير متاح - تم تحديث المسار',
    time: 'منذ 12 دقيقة',
    type: 'warning',
  },
  {
    id: 3,
    text: 'تم تحديث المسار 2 بنجاح',
    time: 'منذ 20 دقيقة',
    type: 'success',
  },
  {
    id: 4,
    text: 'تنبيه: تراكم عالي في عدة حاويات',
    time: 'منذ 25 دقيقة',
    type: 'alert',
  },
  {
    id: 5,
    text: 'تم إضافة مسار جديد لمركبة 4',
    time: 'منذ 35 دقيقة',
    type: 'info',
  },
  {
    id: 6,
    text: 'اكتمال جمع النفايات لمسار مركبة 2',
    time: 'منذ ساعة',
    type: 'success',
  },
];

interface UpdatesBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatesBottomSheet({ isOpen, onClose }: UpdatesBottomSheetProps) {
  const updates = SYSTEM_UPDATES;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border rounded-t-2xl shadow-2xl overflow-hidden md:h-[40vh] h-[50vh]"
          style={{ zIndex: 1400 }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">آخر التحديثات</h3>
                <p className="text-xs text-muted-foreground">التحديثات الأخيرة للنظام</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Updates List */}
          <div className="p-5 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
            {updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border-2 ${
                  update.type === 'alert'
                    ? 'bg-destructive/5 border-destructive/20'
                    : update.type === 'warning'
                    ? 'bg-warning/5 border-warning/20'
                    : update.type === 'success'
                    ? 'bg-success/5 border-success/20'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <p className="text-foreground mb-2 font-medium">{update.text}</p>
                <p className="text-xs text-muted-foreground">{update.time}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
