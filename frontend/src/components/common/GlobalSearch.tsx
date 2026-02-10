/**
 * Global Search Component
 *
 * A modal-based search interface that allows users to search across
 * sermons, events, pages, and people
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, Video, Calendar, FileText, Users, MapPin, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';

interface SearchResult {
  id: string;
  title: string;
  titleThai: string;
  type: 'page' | 'sermon' | 'event' | 'ministry' | 'blog';
  description: string;
  descriptionThai: string;
  url: string;
  date?: string;
}

// Sample search data - in production, this would come from an API
const searchableContent: SearchResult[] = [
  // Pages
  {
    id: 'page-1',
    title: 'Home',
    titleThai: 'หน้าแรก',
    type: 'page',
    description: 'Main landing page',
    descriptionThai: 'หน้าแรก',
    url: '/',
  },
  {
    id: 'page-2',
    title: 'About Us',
    titleThai: 'เกี่ยวกับเรา',
    type: 'page',
    description: 'Learn about our church',
    descriptionThai: 'เรียนรู้เกี่ยวกับโบสถ์ของเรา',
    url: '/about',
  },
  {
    id: 'page-3',
    title: 'Plan Your Visit',
    titleThai: 'วางแผนการมาเยี่ยม',
    type: 'page',
    description: 'First time visitor info',
    descriptionThai: 'ข้อมูลสำหรับผู้เยี่ยมชมครั้งแรก',
    url: '/visit',
  },
  {
    id: 'page-4',
    title: 'Sermons',
    titleThai: 'คำเทศนา',
    type: 'page',
    description: 'Watch and listen to sermons',
    descriptionThai: 'ดูและฟังคำเทศนา',
    url: '/sermons',
  },
  {
    id: 'page-5',
    title: 'Events Calendar',
    titleThai: 'ปฏิทินกิจกรรม',
    type: 'page',
    description: 'Upcoming church events',
    descriptionThai: 'กิจกรรมโบสถ์ที่กำลังจะมาถึง',
    url: '/events',
  },
  {
    id: 'page-6',
    title: 'Prayer Requests',
    titleThai: 'คำอธิษฐาน',
    type: 'page',
    description: 'Submit prayer requests',
    descriptionThai: 'ส่งคำอธิษฐาน',
    url: '/prayer',
  },
  {
    id: 'page-7',
    title: 'Give & Donate',
    titleThai: 'ถวาย',
    type: 'page',
    description: 'Support our ministry',
    descriptionThai: 'สนับสนุนพันธกิจของเรา',
    url: '/give',
  },
  {
    id: 'page-8',
    title: 'Resources',
    titleThai: 'ทรัพยากร',
    type: 'page',
    description: 'Bible study guides and more',
    descriptionThai: 'คู่มือศึกษาพระคัมภีร์และอื่นๆ',
    url: '/resources',
  },
  {
    id: 'page-9',
    title: 'Photo Gallery',
    titleThai: 'แกลเลอรี่ภาพ',
    type: 'page',
    description: 'Church photos and memories',
    descriptionThai: 'ภาพและความทรงจำของโบสถ์',
    url: '/gallery',
  },
  {
    id: 'page-10',
    title: 'News & Blog',
    titleThai: 'ข่าวและบทความ',
    type: 'page',
    description: 'Latest updates and stories',
    descriptionThai: 'ข่าวสารและเรื่องราวล่าสุด',
    url: '/blog',
  },
  // Ministries
  {
    id: 'ministry-1',
    title: 'Youth Ministry',
    titleThai: 'พันธกิจเยาวชน',
    type: 'ministry',
    description: 'Programs for teens and young adults',
    descriptionThai: 'โปรแกรมสำหรับวัยรุ่นและเยาวชน',
    url: '/ministries/youth',
  },
  {
    id: 'ministry-2',
    title: "Women's Ministry",
    titleThai: 'พันธกิจสตรี',
    type: 'ministry',
    description: 'Fellowship and growth for women',
    descriptionThai: 'สามัคคีธรรมและการเติบโตสำหรับสตรี',
    url: '/ministries/womens',
  },
  {
    id: 'ministry-3',
    title: 'Pathfinders',
    titleThai: 'พาธไฟน์เดอร์',
    type: 'ministry',
    description: 'SDA scouting program',
    descriptionThai: 'โปรแกรมลูกเสือ SDA',
    url: '/ministries/pathfinders',
  },
  {
    id: 'ministry-4',
    title: 'Health Ministry',
    titleThai: 'พันธกิจสุขภาพ',
    type: 'ministry',
    description: 'Wellness programs',
    descriptionThai: 'โปรแกรมสุขภาพ',
    url: '/ministries/health',
  },
  // Sermons
  {
    id: 'sermon-1',
    title: 'Living by Faith',
    titleThai: 'ดำเนินชีวิตโดยความเชื่อ',
    type: 'sermon',
    description: 'Pastor Somchai',
    descriptionThai: 'ศิษยาภิบาลสมชาย',
    url: '/sermons',
    date: '2026-01-25',
  },
  {
    id: 'sermon-2',
    title: 'The Power of Prayer',
    titleThai: 'พลังแห่งการอธิษฐาน',
    type: 'sermon',
    description: 'Pastor Somchai',
    descriptionThai: 'ศิษยาภิบาลสมชาย',
    url: '/sermons',
    date: '2026-01-18',
  },
  // Events
  {
    id: 'event-1',
    title: 'Community Health Fair',
    titleThai: 'งานสุขภาพชุมชน',
    type: 'event',
    description: 'Free health screenings',
    descriptionThai: 'ตรวจสุขภาพฟรี',
    url: '/events/3',
    date: '2026-02-14',
  },
  {
    id: 'event-2',
    title: 'Youth Camp 2026',
    titleThai: 'ค่ายเยาวชน 2026',
    type: 'event',
    description: 'Annual youth retreat',
    descriptionThai: 'ค่ายเยาวชนประจำปี',
    url: '/events/5',
    date: '2026-03-20',
  },
  // Blog
  {
    id: 'blog-1',
    title: 'Youth Camp Registration Open',
    titleThai: 'เปิดลงทะเบียนค่ายเยาวชน',
    type: 'blog',
    description: 'Register now',
    descriptionThai: 'ลงทะเบียนเลย',
    url: '/blog',
    date: '2026-01-28',
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'sermon':
      return Video;
    case 'event':
      return Calendar;
    case 'ministry':
      return Users;
    case 'blog':
      return FileText;
    default:
      return MapPin;
  }
};

const getTypeLabel = (type: string, language: string) => {
  const labels: Record<string, { en: string; th: string }> = {
    page: { en: 'Page', th: 'หน้า' },
    sermon: { en: 'Sermon', th: 'เทศนา' },
    event: { en: 'Event', th: 'กิจกรรม' },
    ministry: { en: 'Ministry', th: 'พันธกิจ' },
    blog: { en: 'Article', th: 'บทความ' },
  };
  return labels[type]?.[language === 'th' ? 'th' : 'en'] || type;
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { language } = useI18n();

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(' ');
    return searchableContent
      .filter((item) => {
        const titleMatch =
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.titleThai.toLowerCase().includes(query.toLowerCase());
        const descMatch =
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.descriptionThai.toLowerCase().includes(query.toLowerCase());
        const typeMatch = item.type.toLowerCase().includes(query.toLowerCase());

        return (
          titleMatch ||
          descMatch ||
          typeMatch ||
          searchTerms.every(
            (term) =>
              item.title.toLowerCase().includes(term) ||
              item.titleThai.includes(term) ||
              item.description.toLowerCase().includes(term)
          )
        );
      })
      .slice(0, 10);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search Modal */}
      <div className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-200 px-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'th'
                ? 'ค้นหาเทศนา, กิจกรรม, หน้า...'
                : 'Search sermons, events, pages...'
            }
            className="flex-1 px-4 py-4 text-lg focus:outline-none"
          />
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-500">
              <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p>{language === 'th' ? 'พิมพ์เพื่อค้นหา...' : 'Start typing to search...'}</p>
              <p className="mt-2 text-sm text-slate-400">
                {language === 'th' ? 'กด ESC เพื่อปิด' : 'Press ESC to close'}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>
                {language === 'th' ? 'ไม่พบผลลัพธ์สำหรับ' : 'No results found for'} &quot;{query}
                &quot;
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {language === 'th' ? 'ลองค้นหาคำอื่น' : 'Try a different search term'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        result.type === 'sermon'
                          ? 'bg-purple-100 text-purple-600'
                          : result.type === 'event'
                            ? 'bg-emerald-100 text-emerald-600'
                            : result.type === 'ministry'
                              ? 'bg-blue-100 text-blue-600'
                              : result.type === 'blog'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {language === 'th' ? result.titleThai : result.title}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {language === 'th' ? result.descriptionThai : result.description}
                        {result.date && (
                          <span className="ml-2">
                            •{' '}
                            {new Date(result.date).toLocaleDateString(
                              language === 'th' ? 'th-TH' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {getTypeLabel(result.type, language)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">↵</kbd>
              {language === 'th' ? 'เพื่อเลือก' : 'to select'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">ESC</kbd>
              {language === 'th' ? 'เพื่อปิด' : 'to close'}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            {language === 'th' ? 'เปิดค้นหา' : 'to search'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
