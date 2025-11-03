import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

/**
 * Main Layout Component
 * Wraps pages with Header, Navigation, and Footer
 */
export const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {showNavigation && <Navigation />}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};
