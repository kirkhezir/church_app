/**
 * SEO Component
 *
 * Handles meta tags and OpenGraph for better SEO
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useI18n } from '@/i18n';

interface SEOProps {
  title?: string;
  titleThai?: string;
  description?: string;
  descriptionThai?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  author?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'Sing Buri Adventist Center';
const SITE_NAME_THAI = 'ศูนย์มิชชั่นเซเว่นธ์เดย์แอ๊ดเวนตีสสิงห์บุรี';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = 'https://singburiadventist.org';

export function SEO({
  title,
  titleThai,
  description,
  descriptionThai,
  image = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
  author,
  noIndex = false,
}: SEOProps) {
  const { language } = useI18n();
  const location = useLocation();

  useEffect(() => {
    // Get localized title and description
    const pageTitle = language === 'th' ? titleThai || title : title;
    const pageDescription = language === 'th' ? descriptionThai || description : description;
    const siteName = language === 'th' ? SITE_NAME_THAI : SITE_NAME;

    // Set document title
    const fullTitle = pageTitle ? `${pageTitle} | ${siteName}` : siteName;
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (pageDescription) {
      setMetaTag('description', pageDescription);
    }

    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Language
    setMetaTag('language', language === 'th' ? 'Thai' : 'English');

    // Canonical URL
    const canonicalUrl = `${SITE_URL}${location.pathname}`;
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // OpenGraph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:site_name', siteName, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:locale', language === 'th' ? 'th_TH' : 'en_US', true);

    if (pageDescription) {
      setMetaTag('og:description', pageDescription, true);
    }

    if (image) {
      const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
      setMetaTag('og:image', imageUrl, true);
      setMetaTag('og:image:width', '1200', true);
      setMetaTag('og:image:height', '630', true);
    }

    // Article specific
    if (type === 'article') {
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, true);
      }
      if (author) {
        setMetaTag('article:author', author, true);
      }
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    if (pageDescription) {
      setMetaTag('twitter:description', pageDescription);
    }
    if (image) {
      const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
      setMetaTag('twitter:image', imageUrl);
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      // We don't reset here as the next page will set its own SEO
    };
  }, [
    language,
    title,
    titleThai,
    description,
    descriptionThai,
    image,
    type,
    publishedTime,
    author,
    noIndex,
    location.pathname,
  ]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Default SEO values for different page types
 */
export const DEFAULT_SEO = {
  home: {
    title: 'Welcome',
    titleThai: 'ยินดีต้อนรับ',
    description:
      'Sing Buri Adventist Center - A community of faith, hope, and love where everyone belongs. Join us for Sabbath worship every Saturday.',
    descriptionThai:
      'ศูนย์มิชชั่นเซเว่นธ์เดย์แอ๊ดเวนตีสสิงห์บุรี - ชุมชนแห่งความเชื่อ ความหวัง และความรัก ที่ทุกคนเป็นส่วนหนึ่ง ร่วมนมัสการทุกวันสะบาโต',
  },
  about: {
    title: 'About Us',
    titleThai: 'เกี่ยวกับเรา',
    description:
      "Learn about our church family, our beliefs, and our mission to share God's love in Sing Buri, Thailand.",
    descriptionThai:
      'เรียนรู้เกี่ยวกับครอบครัวโบสถ์ของเรา ความเชื่อ และพันธกิจในการแบ่งปันความรักของพระเจ้าในสิงห์บุรี',
  },
  visit: {
    title: 'Plan Your Visit',
    titleThai: 'วางแผนการมาเยี่ยม',
    description:
      'Everything you need to know for your first visit to Sing Buri Adventist Center. Service times, location, and what to expect.',
    descriptionThai:
      'ทุกสิ่งที่คุณต้องรู้สำหรับการเยี่ยมชมครั้งแรก เวลานมัสการ สถานที่ และสิ่งที่คาดหวัง',
  },
  sermons: {
    title: 'Sermons',
    titleThai: 'คำเทศนา',
    description:
      'Watch and listen to past sermons from Sing Buri Adventist Center. Grow in faith with Bible-based messages.',
    descriptionThai:
      'ดูและฟังคำเทศนาจากศูนย์มิชชั่นสิงห์บุรี เติบโตในความเชื่อด้วยข่าวสารที่มีพื้นฐานจากพระคัมภีร์',
  },
  events: {
    title: 'Events',
    titleThai: 'กิจกรรม',
    description:
      'Upcoming events and activities at Sing Buri Adventist Center. Join us for fellowship and spiritual growth.',
    descriptionThai:
      'กิจกรรมที่กำลังจะมาถึงที่ศูนย์มิชชั่นสิงห์บุรี ร่วมสามัคคีธรรมและเติบโตฝ่ายจิตวิญญาณ',
  },
  prayer: {
    title: 'Prayer Requests',
    titleThai: 'คำอธิษฐาน',
    description:
      'Submit your prayer requests. Our prayer team is here to support you and lift your needs to God.',
    descriptionThai: 'ส่งคำอธิษฐานของคุณ ทีมอธิษฐานพร้อมสนับสนุนและยกคำขอของคุณต่อพระเจ้า',
  },
  give: {
    title: 'Give & Donate',
    titleThai: 'ถวายและบริจาค',
    description:
      'Support the ministry of Sing Buri Adventist Center. Your generous gifts help spread the gospel.',
    descriptionThai: 'สนับสนุนพันธกิจของศูนย์มิชชั่นสิงห์บุรี การถวายช่วยเผยแพร่ข่าวประเสริฐ',
  },
  gallery: {
    title: 'Photo Gallery',
    titleThai: 'แกลเลอรี่ภาพ',
    description: 'Browse photos from church events, worship services, and community activities.',
    descriptionThai: 'ดูภาพจากกิจกรรมโบสถ์ การนมัสการ และกิจกรรมชุมชน',
  },
  ministries: {
    title: 'Ministries',
    titleThai: 'พันธกิจ',
    description:
      "Explore our ministries and find your place to serve. Youth, women's, health, and more.",
    descriptionThai: 'สำรวจพันธกิจและค้นหาที่ของคุณในการรับใช้ เยาวชน สตรี สุขภาพ และอื่นๆ',
  },
  blog: {
    title: 'News & Blog',
    titleThai: 'ข่าวและบทความ',
    description:
      'Latest news, announcements, and inspiring stories from Sing Buri Adventist Center.',
    descriptionThai: 'ข่าวสารล่าสุด ประกาศ และเรื่องราวที่สร้างแรงบันดาลใจจากศูนย์มิชชั่นสิงห์บุรี',
  },
  resources: {
    title: 'Resources',
    titleThai: 'ทรัพยากร',
    description:
      'Bible study guides, sermon notes, Sabbath School lessons, and other spiritual resources.',
    descriptionThai:
      'คู่มือศึกษาพระคัมภีร์ บันทึกเทศนา บทเรียนโรงเรียนสะบาโต และทรัพยากรฝ่ายจิตวิญญาณอื่นๆ',
  },
};

export default SEO;
