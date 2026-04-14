import { RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

interface RouteActionsProps {
  onRegenerate: () => void;
  onApprove: () => void;
  isRegenerating: boolean;
}

export function RouteActions({ onRegenerate, onApprove, isRegenerating }: RouteActionsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRegenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        <span className="font-medium">
          {isRegenerating ? 'جاري التحديث...' : 'إعادة توليد الخطة'}
        </span>
      </button>

      <button
        onClick={onApprove}
        disabled={isRegenerating}
        className="flex items-center gap-2 px-5 py-2.5 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">اعتماد الخطة الحالية</span>
      </button>
    </div>
  );
}
