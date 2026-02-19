/**
 * 404 Not Found Page
 *
 * Church-branded 404 page with:
 * - i18n support (English / Thai)
 * - Quick navigation links
 * - Search suggestion
 * - Dark mode support
 */

import { Link } from 'react-router';
import { Home, Calendar, BookOpen, ArrowLeft, Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  const { language } = useI18n();
  useDocumentTitle('Page Not Found', 'ไม่พบหน้า', language);

  const quickLinks = [
    {
      to: '/',
      icon: Home,
      label: language === 'th' ? 'หน้าแรก' : 'Home',
      description: language === 'th' ? 'กลับไปหน้าแรก' : 'Go back to the homepage',
    },
    {
      to: '/events',
      icon: Calendar,
      label: language === 'th' ? 'กิจกรรม' : 'Events',
      description: language === 'th' ? 'ดูกิจกรรมที่กำลังจะมา' : 'View upcoming events',
    },
    {
      to: '/sermons',
      icon: BookOpen,
      label: language === 'th' ? 'คำเทศนา' : 'Sermons',
      description: language === 'th' ? 'ฟังคำเทศนาล่าสุด' : 'Listen to recent sermons',
    },
    {
      to: '/about',
      icon: Church,
      label: language === 'th' ? 'เกี่ยวกับเรา' : 'About Us',
      description: language === 'th' ? 'เรียนรู้เกี่ยวกับโบสถ์ของเรา' : 'Learn about our church',
    },
  ];

  return (
    <PublicLayout>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          {/* 404 Number */}
          <div className="mb-6">
            <span className="text-8xl font-extrabold text-blue-600/20 dark:text-blue-400/20 sm:text-9xl">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
            {language === 'th' ? 'ไม่พบหน้าที่คุณต้องการ' : 'Page Not Found'}
          </h1>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            {language === 'th'
              ? 'ขออภัย หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่ ลองลิงก์ด้านล่างเพื่อค้นหาสิ่งที่คุณต้องการ'
              : "Sorry, the page you're looking for may have been moved, deleted, or never existed. Try the links below to find what you need."}
          </p>

          {/* Primary Actions */}
          <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button size="lg" className="gap-2">
                <Home className="h-4 w-4" />
                {language === 'th' ? 'กลับหน้าแรก' : 'Go Home'}
              </Button>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'th' ? 'ย้อนกลับ' : 'Go Back'}
            </button>
          </div>

          {/* Quick Links Grid */}
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              {language === 'th' ? 'หรือลองหน้าเหล่านี้:' : 'Or try these pages:'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickLinks.map(({ to, icon: Icon, label, description }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md dark:border-border dark:hover:border-blue-600"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary">
                      {label}
                    </p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Scripture Quote */}
          <div className="p-6/50 mt-12 rounded-xl bg-muted">
            <p className="italic text-muted-foreground">
              {language === 'th'
                ? '"เพราะเรารู้แผนงานที่เรามีไว้สำหรับเจ้า" พระเจ้าตรัส "แผนงานเพื่อความเจริญรุ่งเรืองและไม่ใช่เพื่อทำร้ายเจ้า แผนงานเพื่อให้ความหวังและอนาคตแก่เจ้า"'
                : '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."'}
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {language === 'th' ? '— เยเรมีย์ 29:11' : '— Jeremiah 29:11'}
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default NotFoundPage;
