// Frontend entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import { Toaster } from './components/ui/toaster';
import './styles/globals.css';

// Initialize Sentry before rendering
initSentry();

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
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
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>
);
