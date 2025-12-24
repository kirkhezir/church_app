/**
 * Offline Indicator Component
 *
 * Shows when the user is offline
 */

import { useOnlineStatus } from './PWAInstallPrompt';
import { WifiOff } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-yellow-500 px-4 py-2 text-sm font-medium text-yellow-950',
        className
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>You're offline. Some features may be unavailable.</span>
    </div>
  );
}
