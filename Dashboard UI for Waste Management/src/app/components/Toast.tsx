import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background rounded-xl px-5 py-3 shadow-2xl flex items-center gap-2 text-sm font-medium"
          style={{ zIndex: 2000 }}
          dir="rtl"
        >
          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
