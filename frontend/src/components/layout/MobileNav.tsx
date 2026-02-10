/**
 * Mobile Navigation Component
 *
 * A slide-out mobile menu for small screens
 */

import * as React from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Home, Calendar, Megaphone, Mail, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, requiresAuth: true },
  { label: 'Events', href: '/events', icon: Calendar, requiresAuth: true },
  { label: 'Announcements', href: '/announcements', icon: Megaphone, requiresAuth: true },
  { label: 'Messages', href: '/messages', icon: Mail, requiresAuth: true },
  { label: 'Profile', href: '/profile', icon: User, requiresAuth: true },
  { label: 'Admin', href: '/admin', icon: Settings, requiresAuth: true, roles: ['ADMIN'] },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const filteredItems = navItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.roles && user && !item.roles.includes(user.role)) return false;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <Link to="/" className="text-lg font-semibold text-primary" onClick={handleNavClick}>
              Church App
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          {isAuthenticated && user && (
            <div className="border-b px-4 py-3">
              <p className="font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {user.role}
              </span>
            </div>
          )}

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t px-4 py-4">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={handleNavClick}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={handleNavClick}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
