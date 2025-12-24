/**
 * PWA Install Prompt Component
 *
 * Shows a prompt to install the app on mobile devices
 */

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return;
    }

    // Check if prompt was dismissed recently
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show iOS instructions if on iOS and not installed
    if (isIOSDevice && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">Install Church App</h3>

              {isIOS ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap the{' '}
                  <svg
                    className="inline h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>{' '}
                  share button, then "Add to Home Screen"
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Get quick access from your home screen
                </p>
              )}

              <div className="mt-3 flex gap-2">
                {!isIOS && deferredPrompt && (
                  <Button size="sm" onClick={handleInstall}>
                    <Download className="mr-2 h-4 w-4" />
                    Install
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Not Now
                </Button>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to detect if app is installed as PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsPWA(isStandalone || isInWebAppiOS);
  }, []);

  return isPWA;
}

/**
 * Hook to detect online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
