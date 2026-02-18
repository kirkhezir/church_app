/**
 * Shared Public Navigation Header Component
 *
 * Used by both PublicLayout (sub-pages) and LandingPage (home page).
 * Eliminates navigation duplication between the two layouts while
 * supporting both transparent-hero and solid-white header modes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Menu,
  X,
  LogIn,
  ChevronDown,
  Search,
  HeartHandshake,
  Gift,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/common/LanguageToggle';
import GlobalSearch from '@/components/common/GlobalSearch';
import { LiveServiceIndicator } from '@/components/common/LiveServiceIndicator';
import { useI18n } from '@/i18n';

// =============================================================================
// CONSTANTS
// =============================================================================
const CHURCH_LOGO = '/church-logo.png';

interface NavLink {
  labelKey: string;
  href: string;
  isExternal?: boolean;
  isPage?: boolean;
  children?: NavLink[];
}

const NAV_LINKS: NavLink[] = [
  { labelKey: 'nav.home', href: '/', isPage: true },
  { labelKey: 'nav.about', href: '/about', isPage: true },
  { labelKey: 'nav.visit', href: '/visit', isPage: true },
  {
    labelKey: 'nav.explore',
    href: '#',
    children: [
      { labelKey: 'nav.ministries', href: '/ministries', isPage: true },
      { labelKey: 'nav.events', href: '/events', isPage: true },
      { labelKey: 'nav.sermons', href: '/sermons', isPage: true },
      { labelKey: 'nav.gallery', href: '/gallery', isPage: true },
      { labelKey: 'nav.blog', href: '/blog', isPage: true },
      { labelKey: 'nav.resources', href: '/resources', isPage: true },
    ],
  },
  { labelKey: 'nav.prayer', href: '/prayer', isPage: true },
  { labelKey: 'nav.give', href: '/give', isPage: true },
  { labelKey: 'nav.contact', href: '/#contact' },
];

// =============================================================================
// COMPONENT
// =============================================================================
interface PublicNavigationHeaderProps {
  /** Show transparent header that transitions to white on scroll */
  transparentHeader?: boolean;
  /** Home page mode: Home scrolls to top, Contact scrolls to #contact */
  isHomePage?: boolean;
  /** Content above the nav bar (e.g. AnnouncementBanner) */
  topContent?: React.ReactNode;
  /** Show LiveServiceIndicator in the desktop nav */
  showLiveIndicator?: boolean;
}

export function PublicNavigationHeader({
  transparentHeader = false,
  isHomePage = false,
  topContent,
  showLiveIndicator = false,
}: PublicNavigationHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Keyboard shortcuts: Escape closes menu, Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle hash scrolling after navigation (e.g. navigating to /#contact from a sub-page)
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const scrollToSection = useCallback((hash: string) => {
    const element = document.querySelector(hash);
    if (element) {
      const offset = 80; // account for fixed header
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - offset, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, []);

  /** Handle click on a nav link — special behaviour on the home page */
  const handleNavClick = useCallback(
    (link: NavLink) => {
      setIsMobileMenuOpen(false);
      setOpenDropdown(null);

      if (isHomePage) {
        if (link.labelKey === 'nav.home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        if (link.labelKey === 'nav.contact') {
          scrollToSection('#contact');
          return;
        }
      }

      // Handle hash links on non-home pages (Link navigates, useEffect scrolls)
      if (link.href.startsWith('/#') && location.pathname === '/') {
        const hash = link.href.substring(1);
        const element = document.querySelector(hash);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [isHomePage, scrollToSection, location.pathname]
  );

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href === '#' || href === '/#contact') return false;
    return location.pathname.startsWith(href);
  };

  const showTransparent = transparentHeader && !isScrolled;

  // Background: home page gets a dark gradient for hero readability; sub-pages get full transparent
  const headerBg = showTransparent
    ? isHomePage
      ? 'bg-gradient-to-b from-black/50 to-transparent'
      : 'bg-transparent'
    : 'border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md';

  /** Should this link render as a <button> instead of a <Link>? */
  const isButtonLink = (link: NavLink) =>
    isHomePage && (link.labelKey === 'nav.home' || link.labelKey === 'nav.contact');

  // ---------------------------------------------------------------------------
  // Style helpers — keep JSX clean
  // ---------------------------------------------------------------------------
  const desktopLinkCls = (link: NavLink) => {
    const base =
      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200';
    switch (link.labelKey) {
      case 'nav.prayer':
        return `${base} ${showTransparent ? 'text-purple-300 hover:bg-purple-500/20 hover:text-purple-200' : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'}`;
      case 'nav.give':
        return `${base} ${showTransparent ? 'text-amber-300 hover:bg-amber-500/20 hover:text-amber-200' : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'}`;
      case 'nav.contact':
        return `${base} ${showTransparent ? 'text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200' : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'}`;
      default:
        if (isActive(link.href)) {
          return `${base} ${showTransparent ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`;
        }
        return `${base} ${showTransparent ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;
    }
  };

  const mobileLinkCls = (link: NavLink) => {
    const base =
      'flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium transition-colors';
    switch (link.labelKey) {
      case 'nav.prayer':
        return `${base} text-purple-600 hover:bg-purple-50`;
      case 'nav.give':
        return `${base} text-amber-600 hover:bg-amber-50`;
      case 'nav.contact':
        return `${base} text-emerald-600 hover:bg-emerald-50`;
      default:
        return `${base} ${isActive(link.href) ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'}`;
    }
  };

  const navIcon = (labelKey: string, mobile = false) => {
    const size = mobile ? 'h-5 w-5' : 'h-4 w-4';
    switch (labelKey) {
      case 'nav.prayer':
        return <HeartHandshake className={`${size} ${mobile ? 'text-purple-500' : ''}`} />;
      case 'nav.give':
        return <Gift className={`${size} ${mobile ? 'text-amber-500' : ''}`} />;
      case 'nav.contact':
        return <MessageSquare className={`${size} ${mobile ? 'text-emerald-500' : ''}`} />;
      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className="fixed inset-x-0 top-0 z-50">
        {topContent}

        {/* Skip to content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Skip to main content
        </a>

        <header className={`transition-all duration-300 ${headerBg}`}>
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* ---- Logo ---- */}
            {isHomePage ? (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex cursor-pointer items-center gap-2 rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                aria-label="Go to top"
              >
                <img
                  src={CHURCH_LOGO}
                  alt={t('common.churchName')}
                  className="h-10 w-10 rounded-full object-contain"
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
              </button>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <img
                  src={CHURCH_LOGO}
                  alt={t('common.churchName')}
                  className="h-10 w-10 rounded-full object-contain"
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
            )}

            {/* ---- Desktop Navigation ---- */}
            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <div key={link.labelKey} className="relative">
                  {link.children ? (
                    /* ---- Dropdown (Explore) ---- */
                    <div
                      onMouseEnter={() => setOpenDropdown(link.labelKey)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        aria-expanded={openDropdown === link.labelKey}
                        aria-haspopup="true"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setOpenDropdown(openDropdown === link.labelKey ? null : link.labelKey);
                          } else if (e.key === 'Escape') {
                            setOpenDropdown(null);
                          }
                        }}
                        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          showTransparent
                            ? 'text-white/90 hover:bg-white/10 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {t(link.labelKey)}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openDropdown === link.labelKey ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openDropdown === link.labelKey && (
                        <div
                          role="menu"
                          className="absolute left-0 top-full z-50 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              role="menuitem"
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                isActive(child.href)
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              {t(child.labelKey)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : isButtonLink(link) ? (
                    /* ---- Button links (Home / Contact on home page) ---- */
                    <button onClick={() => handleNavClick(link)} className={desktopLinkCls(link)}>
                      {navIcon(link.labelKey)}
                      {t(link.labelKey)}
                    </button>
                  ) : (
                    /* ---- Regular nav links ---- */
                    <Link
                      to={link.href}
                      onClick={() => handleNavClick(link)}
                      className={desktopLinkCls(link)}
                    >
                      {navIcon(link.labelKey)}
                      {t(link.labelKey)}
                    </Link>
                  )}
                </div>
              ))}

              {/* Language Toggle */}
              <LanguageToggle compact lightMode={showTransparent} />

              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`rounded-lg p-2 transition-colors ${
                  showTransparent
                    ? 'text-white/90 hover:bg-white/10'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Live Indicator (sub-pages only) */}
              {showLiveIndicator && <LiveServiceIndicator compact className="hidden lg:flex" />}

              {/* Login Button — Premium Design */}
              <Link to="/login" className="ml-2">
                <Button
                  size="sm"
                  className={`group relative overflow-hidden px-5 py-2 font-semibold tracking-wide transition-all duration-300 hover:scale-105 ${
                    showTransparent
                      ? 'border-2 border-white/80 bg-white/10 text-white shadow-lg shadow-white/10 backdrop-blur-sm hover:border-white hover:bg-white hover:text-blue-600 hover:shadow-white/20'
                      : 'border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                    {t('common.login')}
                  </span>
                  {/* Animated background shine effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Button>
              </Link>
            </div>

            {/* ---- Mobile Menu Toggle ---- */}
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

          {/* ---- Mobile Menu ---- */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />
              {/* Panel */}
              <div className="relative z-50 max-h-[80vh] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg md:hidden">
                <div className="flex flex-col space-y-1">
                  {NAV_LINKS.map((link) =>
                    link.children ? (
                      /* ---- Mobile dropdown (Explore) ---- */
                      <div key={link.labelKey}>
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === link.labelKey ? null : link.labelKey)
                          }
                          className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
                        >
                          {t(link.labelKey)}
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${openDropdown === link.labelKey ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openDropdown === link.labelKey && (
                          <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-4">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setOpenDropdown(null);
                                }}
                                className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                  isActive(child.href)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {t(child.labelKey)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : isButtonLink(link) ? (
                      /* ---- Mobile button links (Home / Contact on home page) ---- */
                      <button
                        key={link.labelKey}
                        onClick={() => handleNavClick(link)}
                        className={mobileLinkCls(link)}
                      >
                        {navIcon(link.labelKey, true)}
                        {t(link.labelKey)}
                      </button>
                    ) : (
                      /* ---- Mobile regular links ---- */
                      <Link
                        key={link.labelKey}
                        to={link.href}
                        onClick={() => handleNavClick(link)}
                        className={mobileLinkCls(link)}
                      >
                        {navIcon(link.labelKey, true)}
                        {t(link.labelKey)}
                      </Link>
                    )
                  )}
                  <hr className="my-2" />
                  {/* Mobile Login Button — Premium Design */}
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-base font-semibold tracking-wide text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    <LogIn className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    {t('common.memberLogin')}
                    {/* Animated shine effect */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </header>
      </div>
    </>
  );
}

export default PublicNavigationHeader;
