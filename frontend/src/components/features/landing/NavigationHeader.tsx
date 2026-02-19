/**
 * Navigation Header Component
 *
 * Sticky navigation for the landing page
 * Shows/hides based on scroll position
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../../ui/button';
import {
  Menu,
  X,
  LogIn,
  Church,
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  Clock,
} from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about', icon: Church },
  { label: 'Service Times', href: '#worship-times', icon: Clock },
  { label: 'Events', href: '#events', icon: Calendar },
  { label: 'Ministries', href: '#ministries', icon: Users },
  { label: 'Location', href: '#location', icon: MapPin },
  { label: 'Contact', href: '#contact', icon: MessageSquare },
];

export function NavigationHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          isScrolled ? 'bg-background/95 shadow-lg backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 text-xl font-bold transition-colors ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}
            >
              <Church className="h-8 w-8" />
              <span className="hidden sm:inline">Sing Buri Adventist</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'text-foreground/80 hover:bg-muted hover:text-primary'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:block">
                <Button
                  variant={isScrolled ? 'outline' : 'secondary'}
                  size="sm"
                  className={
                    isScrolled
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                      : 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                  }
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Member Login
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`rounded-lg p-2 lg:hidden ${
                  isScrolled ? 'text-foreground/80 hover:bg-muted' : 'text-white hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="border-t border-border bg-white px-4 py-4 shadow-lg">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-foreground/80 hover:bg-muted"
                >
                  <link.icon className="h-5 w-5 text-blue-600" />
                  {link.label}
                </button>
              ))}
              <hr className="my-2" />
              <Link
                to="/login"
                className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white"
              >
                <LogIn className="h-5 w-5" />
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer when scrolled (to prevent content jump) */}
      {isScrolled && <div className="h-16" />}
    </>
  );
}

export default NavigationHeader;
