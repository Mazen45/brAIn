import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AlertBannerProps {
  hasIssue: boolean;
  message: string;
}

export function AlertBanner({ hasIssue, message }: AlertBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className={`
        rounded-xl p-5 border-2 shadow-lg
        ${hasIssue
          ? 'bg-warning/10 border-warning/40 text-warning'
          : 'bg-success/10 border-success/40 text-success'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${hasIssue ? 'bg-warning/20' : 'bg-success/20'}
        `}>
          {hasIssue ? (
            <AlertCircle className="w-6 h-6 animate-pulse" />
          ) : (
            <CheckCircle className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="font-semibold text-base">{hasIssue ? 'تنبيه النظام' : 'الحالة طبيعية'}</p>
          <p className="text-sm mt-0.5 opacity-90">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
