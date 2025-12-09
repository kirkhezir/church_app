// Frontend entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import './styles/globals.css';

// Initialize Sentry before rendering
initSentry();

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
        </AuthProvider>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>
);
