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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      {showNavigation && <Navigation />}
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};
