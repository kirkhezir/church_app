/**
 * Language Toggle Component
 *
 * Allows users to switch between Thai and English
 * Displays as a compact button/dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n, Language, LANGUAGE_NAMES } from '../../i18n';

interface LanguageToggleProps {
  /** Compact mode shows just the icon and current language code */
  compact?: boolean;
  /** Light mode for dark backgrounds */
  lightMode?: boolean;
  /** Custom class name */
  className?: string;
}

export function LanguageToggle({
  compact = false,
  lightMode = false,
  className = '',
}: LanguageToggleProps) {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const languages: Language[] = ['en', 'th'];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const baseClasses = lightMode
    ? 'text-white hover:bg-white/10'
    : 'text-muted-foreground hover:bg-muted';

  const dropdownClasses = lightMode ? 'bg-slate-800 border-border' : 'bg-white border-border';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${baseClasses}`}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4" />
        {compact ? (
          <span className="uppercase">{language}</span>
        ) : (
          <span>{LANGUAGE_NAMES[language]}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full z-[100] mt-1 min-w-[120px] overflow-hidden rounded-lg border shadow-lg ${dropdownClasses}`}
          role="listbox"
          aria-label="Select language"
        >
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                lightMode ? 'text-white hover:bg-slate-700' : 'text-foreground/80 hover:bg-muted'
              } ${language === lang ? 'font-medium' : ''}`}
              role="option"
              aria-selected={language === lang}
            >
              <span>{LANGUAGE_NAMES[lang]}</span>
              {language === lang && (
                <Check
                  className={`h-4 w-4 ${lightMode ? 'text-emerald-400' : 'text-emerald-500'}`}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageToggle;
