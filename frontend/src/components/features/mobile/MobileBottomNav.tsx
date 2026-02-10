/**
 * Mobile Bottom Navigation Component
 *
 * Bottom navigation bar for mobile devices
 */

import { useLocation, useNavigate } from 'react-router';
import { Home, Calendar, Bell, MessageSquare, User } from 'lucide-react';
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
  const navigate = useNavigate();

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
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/app/profile' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
              isActive(item.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-1 h-4 min-w-4 px-1 text-[10px]"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </div>
            <span>{item.label}</span>
            {isActive(item.path) && (
              <div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
