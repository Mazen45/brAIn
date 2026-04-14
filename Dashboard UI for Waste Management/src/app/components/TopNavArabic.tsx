import { Bell, User } from 'lucide-react';

export function TopNavArabic() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-primary rounded-full animate-pulse"></div>
        <h2 className="text-lg font-semibold text-foreground">نظام إدارة النفايات</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-all duration-200 group">
          <span className="text-sm font-medium text-foreground hidden md:block">مستخدم النظام</span>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <User className="w-4 h-4 text-primary" />
          </div>
        </button>

        <button className="relative p-2 hover:bg-muted rounded-lg transition-all duration-200 group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
