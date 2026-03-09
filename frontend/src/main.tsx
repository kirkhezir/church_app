// Frontend entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './i18n';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import { ThemeAwareToaster } from './components/ui/ThemeAwareToaster';
import './styles/globals.css';
import 'goey-toast/styles.css';

// Initialize Sentry before rendering
initSentry();

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.warn('Service Worker registered:', registration.scope);

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, prompt user to refresh
                if (confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.warn('Service Worker updated to version:', event.data.version);
        // Could show a toast notification here
      }
    });

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.warn('New service worker activated, reloading page...');
      window.location.reload();
    });
  });
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Something went wrong. Please refresh the page.</p>
        </div>
      }
    >
      <BrowserRouter>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <App />
              <ThemeAwareToaster />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>
);
