/**
 * Shared Public Footer Component
 *
 * Used by PublicLayout for all public sub-pages, and optionally on the Landing Page.
 * Pass `showNewsletter` to render the newsletter signup section (home page only).
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { Clock, Phone, Mail, MapPin, Heart, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useI18n } from '@/i18n';

const CHURCH_LOGO = '/church-logo.png';

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/singburiadventist',
  youtube: 'https://www.youtube.com/@singburiadventist',
  line: 'https://line.me/ti/p/@singburiadventist',
} as const;

interface PublicFooterProps {
  /** Render the newsletter signup panel (home page only) */
  showNewsletter?: boolean;
}

export function PublicFooter({ showNewsletter = false }: PublicFooterProps) {
  const { t, language } = useI18n();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t bg-slate-900 text-slate-300" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Newsletter Section — home page only */}
        {showNewsletter && (
          <div className="mb-10 rounded-xl bg-slate-800/50 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-white">
                  {t('footer.stayConnected')}
                </h3>
                <p className="text-sm text-muted-foreground">{t('footer.newsletterDesc')}</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-sm gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className="flex-1 rounded-lg border border-border bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label={t('footer.emailPlaceholder')}
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-emerald-600"
                >
                  {subscribed ? `✓ ${t('common.subscribed')}` : t('common.subscribe')}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 sm:items-start md:grid-cols-4">
          {/* Brand / Church Info */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img
                src={CHURCH_LOGO}
                alt={t('common.churchName')}
                className="h-12 w-12 rounded-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <p className="font-bold text-white">{t('common.churchName')}</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              {language === 'th'
                ? 'ชุมชนแห่งความเชื่อ แบ่งปันความรักของพระเจ้าในสิงห์บุรี ประเทศไทย'
                : "A community of faith sharing God's love in Sing Buri, Thailand."}
            </p>
            <a
              href="https://www.adventist.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Seventh-day Adventist Church
            </a>
            <div className="mt-3 flex gap-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-muted-foreground transition-colors hover:bg-blue-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-muted-foreground transition-colors hover:bg-red-600 hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.line}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-muted-foreground transition-colors hover:bg-green-500 hover:text-white"
                aria-label="LINE Official Account"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Clock className="h-4 w-4 text-amber-400" />
              {t('footer.sabbathServices')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>{language === 'th' ? 'โรงเรียนสะบาโต' : 'Sabbath School'}</span>
                <span className="text-muted-foreground">9:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>{language === 'th' ? 'นมัสการ' : 'Divine Service'}</span>
                <span className="text-muted-foreground">11:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>{language === 'th' ? 'โปรแกรม AY' : 'AY Program'}</span>
                <span className="text-muted-foreground">2:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-white">
                  {language === 'th' ? 'หน้าแรก' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-white">
                  {language === 'th' ? 'เกี่ยวกับเรา' : 'About'}
                </Link>
              </li>
              <li>
                <Link to="/visit" className="text-muted-foreground transition-colors hover:text-white">
                  {language === 'th' ? 'มาเยี่ยมเรา' : 'Plan a Visit'}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground transition-colors hover:text-white">
                  {language === 'th' ? 'กิจกรรม' : 'Events'}
                </Link>
              </li>
              <li>
                <Link to="/sermons" className="text-muted-foreground transition-colors hover:text-white">
                  {language === 'th' ? 'คำเทศนา' : 'Sermons'}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.adventist.org/beliefs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  {language === 'th' ? 'ความเชื่อของเรา' : 'Our Beliefs'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              {language === 'th' ? 'ติดต่อ' : 'Contact'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+66876106926"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  +66 876-106-926
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.line}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  LINE: @singburiadventist
                </a>
              </li>
              <li>
                <a
                  href="mailto:singburiadventistcenter@gmail.com"
                  className="flex items-start gap-2 text-muted-foreground transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                  <span className="break-all">singburiadventistcenter@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>Bang Phutsa, Sing Buri 16000, Thailand</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground sm:justify-start">
            <p>
              © {currentYear} {t('common.churchName')}
            </p>
            <span className="hidden sm:inline">•</span>
            <Link to="/privacy" className="transition-colors hover:text-white">
              {t('footer.privacyPolicy')}
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/terms" className="transition-colors hover:text-white">
              {t('footer.termsOfService')}
            </Link>
          </div>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            {t('footer.builtWith')} <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />{' '}
            {t('footer.forCommunity')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
