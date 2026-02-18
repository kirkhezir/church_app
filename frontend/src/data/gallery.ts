/**
 * Gallery static data
 *
 * Centralized photo/album data for the Gallery page.
 * TODO: Replace with API call to galleryService.getAlbums() / galleryService.getPhotos() when backend is ready.
 */

export interface Album {
  id: string;
  title: string;
  titleThai: string;
  description: string;
  descriptionThai: string;
  coverImage: string;
  photoCount: number;
  date: string;
}

export interface Photo {
  id: string;
  src: string;
  thumbnail: string;
  title: string;
  titleThai: string;
  albumId: string;
  date: string;
  photographer?: string;
}

export const albums: Album[] = [
  {
    id: 'sabbath-services',
    title: 'Sabbath Services',
    titleThai: 'นมัสการวันสะบาโต',
    description: 'Weekly worship services and special programs',
    descriptionThai: 'นมัสการประจำสัปดาห์และโปรแกรมพิเศษ',
    coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80',
    photoCount: 24,
    date: '2026-01',
  },
  {
    id: 'youth-activities',
    title: 'Youth Activities',
    titleThai: 'กิจกรรมเยาวชน',
    description: 'AY meetings, camps, and youth outreach',
    descriptionThai: 'การประชุม AY ค่าย และการเผยแพร่เยาวชน',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    photoCount: 18,
    date: '2025-12',
  },
  {
    id: 'community-service',
    title: 'Community Service',
    titleThai: 'บริการชุมชน',
    description: 'Outreach programs and helping our neighbors',
    descriptionThai: 'โปรแกรมช่วยเหลือและการดูแลเพื่อนบ้าน',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    photoCount: 15,
    date: '2025-11',
  },
  {
    id: 'baptism',
    title: 'Baptism Celebrations',
    titleThai: 'พิธีบัพติศมา',
    description: 'Celebrating new members joining our family',
    descriptionThai: 'ฉลองสมาชิกใหม่เข้าร่วมครอบครัว',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    photoCount: 12,
    date: '2025-10',
  },
  {
    id: 'special-events',
    title: 'Special Events',
    titleThai: 'กิจกรรมพิเศษ',
    description: 'Evangelistic meetings and celebrations',
    descriptionThai: 'การประชุมประกาศและงานเฉลิมฉลอง',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    photoCount: 30,
    date: '2025-09',
  },
  {
    id: 'church-family',
    title: 'Church Family',
    titleThai: 'ครอบครัวโบสถ์',
    description: 'Fellowship meals and gatherings',
    descriptionThai: 'อาหารสามัคคีธรรมและการชุมนุม',
    coverImage: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80',
    photoCount: 20,
    date: '2025-08',
  },
];

export const photos: Photo[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&q=80',
    title: 'Sabbath Morning Worship',
    titleThai: 'นมัสการเช้าวันสะบาโต',
    albumId: 'sabbath-services',
    date: '2026-01-25',
    photographer: 'Church Media Team',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    title: 'Pastor Preaching',
    titleThai: 'ศิษยาภิบาลเทศนา',
    albumId: 'sabbath-services',
    date: '2026-01-25',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
    title: 'Youth Group Meeting',
    titleThai: 'การประชุมกลุ่มเยาวชน',
    albumId: 'youth-activities',
    date: '2025-12-20',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80',
    title: 'Community Outreach',
    titleThai: 'การเข้าถึงชุมชน',
    albumId: 'community-service',
    date: '2025-11-15',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
    title: 'Baptism Day',
    titleThai: 'วันบัพติศมา',
    albumId: 'baptism',
    date: '2025-10-10',
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
    title: 'Special Sabbath Program',
    titleThai: 'โปรแกรมสะบาโตพิเศษ',
    albumId: 'special-events',
    date: '2025-09-20',
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&q=80',
    title: 'Fellowship Lunch',
    titleThai: 'อาหารกลางวันสามัคคีธรรม',
    albumId: 'church-family',
    date: '2025-08-15',
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80',
    title: 'Choir Performance',
    titleThai: 'การแสดงคณะนักร้องประสานเสียง',
    albumId: 'sabbath-services',
    date: '2026-01-18',
  },
];
