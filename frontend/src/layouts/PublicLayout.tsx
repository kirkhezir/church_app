/**
 * Public Layout Component
 *
 * Shared layout for all public sub-pages with consistent navigation.
 * Navigation is provided by the shared PublicNavigationHeader component
 * (also used by the LandingPage for consistency).
 */

import React from 'react';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicNavigationHeader } from '@/components/layout/PublicNavigationHeader';
import { FloatingLiveIndicator } from '@/components/common/LiveServiceIndicator';

interface PublicLayoutProps {
  children: React.ReactNode;
  /** Whether to show transparent header (for hero sections) */
  transparentHeader?: boolean;
}

export function PublicLayout({ children, transparentHeader = false }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Shared Navigation Header */}
      <PublicNavigationHeader transparentHeader={transparentHeader} showLiveIndicator />

      {/* Floating Live Indicator */}
      <FloatingLiveIndicator />

      {/* Main Content */}
      <main id="main-content">{children}</main>

      {/* Shared Footer */}
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;
