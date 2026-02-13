/**
 * Shared Public Footer Component
 *
 * Used by PublicLayout for all public sub-pages.
 * Provides consistent footer with service times, quick links, contact info, and social links.
 */

import { Link } from 'react-router';
import { Clock, Phone, Mail, MapPin, Heart, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useI18n } from '@/i18n';

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/singburiadventist',
  youtube: 'https://www.youtube.com/@singburiadventist',
  line: 'https://line.me/ti/p/@singburiadventist',
} as const;

export function PublicFooter() {
  const { t, language } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Church Info */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img
                src="/church-logo.png"
                alt={t('common.churchName')}
                className="h-8 w-8 rounded-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-lg font-bold text-white">{t('common.churchName')}</span>
            </div>
            <p className="mb-3 text-sm text-slate-400">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-red-600 hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.line}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-green-500 hover:text-white"
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
              {language === 'th' ? 'เวลานมัสการวันสะบาโต' : 'Sabbath Services'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>{language === 'th' ? 'โรงเรียนสะบาโต' : 'Sabbath School'}</span>
                <span className="text-slate-400">9:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>{language === 'th' ? 'นมัสการ' : 'Divine Service'}</span>
                <span className="text-slate-400">11:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>{language === 'th' ? 'โปรแกรม AY' : 'AY Program'}</span>
                <span className="text-slate-400">2:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              {language === 'th' ? 'ลิงก์ด่วน' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-slate-400 transition-colors hover:text-white">
                  {language === 'th' ? 'เกี่ยวกับเรา' : 'About'}
                </Link>
              </li>
              <li>
                <Link to="/visit" className="text-slate-400 transition-colors hover:text-white">
                  {language === 'th' ? 'มาเยี่ยมเรา' : 'Plan a Visit'}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-slate-400 transition-colors hover:text-white">
                  {language === 'th' ? 'กิจกรรม' : 'Events'}
                </Link>
              </li>
              <li>
                <Link to="/sermons" className="text-slate-400 transition-colors hover:text-white">
                  {language === 'th' ? 'คำเทศนา' : 'Sermons'}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.adventist.org/beliefs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
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
                  className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
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
                  className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  LINE: @singburiadventist
                </a>
              </li>
              <li>
                <a
                  href="mailto:singburiadventistcenter@gmail.com"
                  className="flex items-start gap-2 text-slate-400 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                  <span className="break-all text-sm">singburiadventistcenter@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>Bang Phutsa, Sing Buri 16000, Thailand</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 sm:justify-start">
            <p>
              © {currentYear} {t('common.churchName')}
            </p>
            <span className="hidden sm:inline">•</span>
            <Link to="/privacy" className="transition-colors hover:text-white">
              {language === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
            </Link>
          </div>
          <p className="flex items-center gap-1.5 text-slate-400">
            {language === 'th' ? 'สร้างด้วย' : 'Built with'}{' '}
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />{' '}
            {language === 'th' ? 'เพื่อชุมชน' : 'for our community'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
