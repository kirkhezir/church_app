/**
 * Mobile Bottom Navigation Component
 *
 * Bottom navigation bar for mobile devices.
 * Uses pill-background active state (Material 3 / iOS 26 style).
 */

import { useLocation, Link } from 'react-router';
import { Home, Calendar, Bell, MessageSquare, Settings } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../../components/ui/badge';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface MobileBottomNavProps {
  unreadMessages?: number;
  unreadNotifications?: number;
}

export function MobileBottomNav({
  unreadMessages = 0,
  unreadNotifications = 0,
}: MobileBottomNavProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/app/dashboard' },
    { icon: <Calendar className="h-5 w-5" />, label: 'Events', path: '/app/events' },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Alerts',
      path: '/app/announcements',
      badge: unreadNotifications,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Messages',
      path: '/app/messages',
      badge: unreadMessages,
    },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', path: '/app/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                active ? 'font-medium text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'relative rounded-xl p-1.5 transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-1 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
