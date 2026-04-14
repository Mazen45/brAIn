import { useState } from 'react';
import { Menu, X, LayoutDashboard, MapPin, Route, Users, FileText, AlertCircle, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileSidebarArabicProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function MobileSidebarArabic({ activeItem, onItemClick }: MobileSidebarArabicProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'map', icon: MapPin, label: 'الخريطة' },
    { id: 'analysis', icon: BarChart3, label: 'تحليل النفايات' },
    { id: 'route', icon: Route, label: 'خطة المسارات' },
    { id: 'drivers', icon: Users, label: 'السائقين والمركبات' },
    { id: 'reports', icon: FileText, label: 'التقارير' },
    { id: 'alerts', icon: AlertCircle, label: 'التنبيهات' },
  ];

  const handleItemClick = (item: string) => {
    onItemClick(item);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5 text-primary-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground z-50 shadow-2xl md:hidden"
              dir="rtl"
            >
              <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">نظام إدارة النفايات</h1>
                  <p className="text-sm text-sidebar-foreground/70 mt-1">لوحة التحكم</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleItemClick(item.id)}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
