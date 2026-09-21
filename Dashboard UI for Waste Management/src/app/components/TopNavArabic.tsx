import { Bell, User } from 'lucide-react';

interface TopNavArabicProps {
  onOpenUpdates: () => void;
  hasUnreadUpdates?: boolean;
  dataMode?: 'demo' | 'custom';
}

export function TopNavArabic({ onOpenUpdates, hasUnreadUpdates = true, dataMode }: TopNavArabicProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-primary rounded-full animate-pulse"></div>
        <h2 className="text-lg font-semibold text-foreground">نظام التوجيه الذكي</h2>
        {dataMode && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              dataMode === 'demo'
                ? 'bg-warning/10 text-warning'
                : 'bg-success/10 text-success'
            }`}
          >
            {dataMode === 'demo' ? 'بيانات تجريبية' : 'بيانات فعلية'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-all duration-200 group">
          <span className="text-sm font-medium text-foreground hidden md:block">مستخدم النظام</span>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <User className="w-4 h-4 text-primary" />
          </div>
        </button>

        <button
          onClick={onOpenUpdates}
          className="relative p-2 hover:bg-muted rounded-lg transition-all duration-200 group"
        >
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {hasUnreadUpdates && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          )}
        </button>
      </div>
    </header>
  );
}
