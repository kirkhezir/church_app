/**
 * Public Layout Component
 *
 * Shared layout for all public pages with consistent navigation
 * Includes header, footer, and common elements
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useI18n } from '@/i18n';

const CHURCH_LOGO = '/church-logo.png';

interface NavLink {
  label: string;
  labelKey: string;
  href: string;
  isExternal?: boolean;
  isPage?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Home', labelKey: 'nav.home', href: '/', isPage: true },
  { label: 'About', labelKey: 'nav.about', href: '/about', isPage: true },
  { label: 'Visit', labelKey: 'nav.visit', href: '/visit', isPage: true },
  { label: 'Sermons', labelKey: 'nav.sermons', href: '/sermons', isPage: true },
  { label: 'Events', labelKey: 'nav.events', href: '/#events' },
  { label: 'Give', labelKey: 'nav.give', href: '/#give' },
  { label: 'Contact', labelKey: 'nav.contact', href: '/#contact' },
];

interface PublicLayoutProps {
  children: React.ReactNode;
  /** Whether to show transparent header (for hero sections) */
  transparentHeader?: boolean;
}

export function PublicLayout({ children, transparentHeader = false }: PublicLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    // Handle hash links
    if (href.startsWith('/#')) {
      const hash = href.substring(1);
      if (location.pathname === '/') {
        // Already on home page, just scroll
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // If not on home page, Link will navigate and then scroll
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href.replace('/#', ''));
  };

  const showTransparent = transparentHeader && !isScrolled;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          showTransparent
            ? 'bg-transparent'
            : 'border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={CHURCH_LOGO}
              alt="Church Logo"
              className="h-10 w-10 rounded-lg object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="hidden sm:block">
              <span
                className={`text-lg font-bold ${showTransparent ? 'text-white' : 'text-slate-900'}`}
              >
                {t('common.churchName')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? showTransparent
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : showTransparent
                      ? 'text-white/90 hover:bg-white/10 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {/* Language Toggle */}
            <LanguageToggle compact lightMode={showTransparent} />

            {/* Login Button */}
            <Link to="/login" className="ml-2">
              <Button
                size="sm"
                className={`font-medium ${
                  showTransparent
                    ? 'bg-white text-blue-600 hover:bg-white/90'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <LogIn className="mr-1.5 h-4 w-4" />
                {t('common.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle compact lightMode={showTransparent} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-lg p-2 ${
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Menu Panel */}
            <div className="fixed inset-x-0 top-16 z-50 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden">
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
                <hr className="my-2" />
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white"
                >
                  <LogIn className="h-5 w-5" />
                  {t('common.login')}
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

export default PublicLayout;
