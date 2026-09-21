import { LayoutDashboard, MapPin, Route, Users, FileText, AlertCircle, BarChart3, Database } from 'lucide-react';

interface SidebarArabicProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function SidebarArabic({ activeItem, onItemClick }: SidebarArabicProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'data', icon: Database, label: 'بيانات النظام' },
    { id: 'map', icon: MapPin, label: 'الخريطة' },
    { id: 'analysis', icon: BarChart3, label: 'تحليل النفايات' },
    { id: 'route', icon: Route, label: 'خطة المسارات' },
    { id: 'drivers', icon: Users, label: 'السائقين والمركبات' },
    { id: 'reports', icon: FileText, label: 'التقارير' },
    { id: 'alerts', icon: AlertCircle, label: 'التنبيهات' },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-full flex flex-col shadow-xl" dir="rtl">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold tracking-tight">نظام التوجيه الذكي</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">لوحة التحكم</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li
                key={item.id}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
                className="animate-[fadeInUp_0.5s_ease-out]"
              >
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                      : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
