/**
 * Prayer Request Page
 *
 * Private prayer request form with prayer wall and prayer updates
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Send,
  Lock,
  Users,
  CheckCircle,
  Eye,
  EyeOff,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';

interface PrayerRequest {
  id: string;
  name: string;
  category: string;
  categoryThai: string;
  request: string;
  requestThai?: string;
  date: string;
  prayerCount: number;
  isPublic: boolean;
}

// Sample public prayer requests (anonymous)
const publicPrayers: PrayerRequest[] = [
  {
    id: '1',
    name: 'Anonymous',
    category: 'Health',
    categoryThai: 'สุขภาพ',
    request: "Please pray for my mother who is recovering from surgery. We trust in God's healing.",
    date: '2026-01-28',
    prayerCount: 15,
    isPublic: true,
  },
  {
    id: '2',
    name: 'A Brother',
    category: 'Family',
    categoryThai: 'ครอบครัว',
    request:
      'Praying for unity and peace in my family. May God guide us through this difficult time.',
    date: '2026-01-27',
    prayerCount: 22,
    isPublic: true,
  },
  {
    id: '3',
    name: 'Church Member',
    category: 'Guidance',
    categoryThai: 'การนำทาง',
    request: "Seeking God's direction for an important career decision. Please pray for wisdom.",
    date: '2026-01-26',
    prayerCount: 18,
    isPublic: true,
  },
  {
    id: '4',
    name: 'A Sister',
    category: 'Thanksgiving',
    categoryThai: 'ขอบพระคุณ',
    request: 'Praising God for answered prayers! My son has accepted Jesus and been baptized.',
    date: '2026-01-25',
    prayerCount: 35,
    isPublic: true,
  },
];

const categories = [
  { id: 'health', name: 'Health', nameThai: 'สุขภาพ' },
  { id: 'family', name: 'Family', nameThai: 'ครอบครัว' },
  { id: 'guidance', name: 'Guidance', nameThai: 'การนำทาง' },
  { id: 'financial', name: 'Financial', nameThai: 'การเงิน' },
  { id: 'spiritual', name: 'Spiritual Growth', nameThai: 'การเติบโตฝ่ายจิตวิญญาณ' },
  { id: 'relationships', name: 'Relationships', nameThai: 'ความสัมพันธ์' },
  { id: 'thanksgiving', name: 'Thanksgiving', nameThai: 'ขอบพระคุณ' },
  { id: 'other', name: 'Other', nameThai: 'อื่นๆ' },
];

export function PrayerPage() {
  const { language } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    request: '',
    isPublic: false,
    wantsPastorContact: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prayedFor, setPrayedFor] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to an API
    console.log('Prayer request submitted:', formData);
    setIsSubmitted(true);
  };

  const handlePrayFor = (id: string) => {
    if (!prayedFor.includes(id)) {
      setPrayedFor([...prayedFor, id]);
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Heart className="mx-auto mb-4 h-12 w-12 text-pink-300" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'คำอธิษฐาน' : 'Prayer Requests'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-purple-100">
            {language === 'th'
              ? 'แบ่งปันคำอธิษฐานของคุณและอธิษฐานเผื่อผู้อื่น'
              : 'Share your prayer needs and pray for others'}
          </p>
          <p className="mt-4 text-sm italic text-purple-200">
            &quot;
            {language === 'th'
              ? 'พระเจ้าทรงอยู่ใกล้คนที่ใจแตกสลาย และทรงช่วยคนที่จิตใจสำนึกผิด'
              : 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'}
            &quot; - {language === 'th' ? 'สดุดี 34:18' : 'Psalm 34:18'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Prayer Request Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                {!isSubmitted ? (
                  <>
                    <h2 className="mb-6 text-xl font-bold text-slate-900">
                      {language === 'th' ? 'ส่งคำอธิษฐาน' : 'Submit a Prayer Request'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          {language === 'th' ? 'ชื่อของคุณ (ไม่จำเป็น)' : 'Your Name (optional)'}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={language === 'th' ? 'ไม่ระบุตัวตน' : 'Anonymous'}
                          className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          {language === 'th' ? 'อีเมล (ไม่จำเป็น)' : 'Email (optional)'}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          {language === 'th' ? 'หมวดหมู่' : 'Category'} *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        >
                          <option value="">
                            {language === 'th' ? 'เลือกหมวดหมู่' : 'Select a category'}
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {language === 'th' ? cat.nameThai : cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          {language === 'th' ? 'คำอธิษฐานของคุณ' : 'Your Prayer Request'} *
                        </label>
                        <textarea
                          value={formData.request}
                          onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                          required
                          rows={5}
                          placeholder={
                            language === 'th'
                              ? 'แบ่งปันคำอธิษฐานของคุณ...'
                              : 'Share your prayer request...'
                          }
                          className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>

                      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={formData.isPublic}
                            onChange={(e) =>
                              setFormData({ ...formData, isPublic: e.target.checked })
                            }
                            className="mt-1"
                          />
                          <label htmlFor="isPublic" className="text-sm text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                              {formData.isPublic ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                              {language === 'th'
                                ? 'แชร์บนกำแพงอธิษฐาน (ไม่ระบุตัวตน)'
                                : 'Share on Prayer Wall (anonymous)'}
                            </span>
                            <span className="text-slate-500">
                              {language === 'th'
                                ? 'ให้ผู้อื่นอธิษฐานเผื่อคุณ'
                                : 'Allow others to pray for you'}
                            </span>
                          </label>
                        </div>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="pastorContact"
                            checked={formData.wantsPastorContact}
                            onChange={(e) =>
                              setFormData({ ...formData, wantsPastorContact: e.target.checked })
                            }
                            className="mt-1"
                          />
                          <label htmlFor="pastorContact" className="text-sm text-slate-600">
                            <span className="font-medium">
                              {language === 'th'
                                ? 'ต้องการให้ศิษยาภิบาลติดต่อ'
                                : 'Request pastor contact'}
                            </span>
                            <span className="block text-slate-500">
                              {language === 'th'
                                ? 'ศิษยาภิบาลจะติดต่อคุณเป็นการส่วนตัว'
                                : 'The pastor will reach out to you personally'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Lock className="h-4 w-4" />
                        {language === 'th'
                          ? 'คำอธิษฐานของคุณจะถูกเก็บเป็นความลับ'
                          : 'Your prayer request is kept confidential'}
                      </div>

                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                        <Send className="mr-2 h-4 w-4" />
                        {language === 'th' ? 'ส่งคำอธิษฐาน' : 'Submit Prayer Request'}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                      {language === 'th' ? 'ส่งคำอธิษฐานสำเร็จ!' : 'Prayer Request Submitted!'}
                    </h3>
                    <p className="mb-6 text-slate-600">
                      {language === 'th'
                        ? 'ทีมอธิษฐานของเราจะอธิษฐานเผื่อคุณ พระเจ้าทรงได้ยินคำอธิษฐานของคุณ'
                        : 'Our prayer team will be praying for you. God hears your prayers.'}
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      {language === 'th' ? 'ส่งคำอธิษฐานอื่น' : 'Submit Another Request'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prayer Promise */}
            <Card className="mt-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6 text-center">
                <h3 className="mb-3 font-bold text-purple-900">
                  {language === 'th' ? 'พันธสัญญาการอธิษฐาน' : 'Our Prayer Promise'}
                </h3>
                <p className="text-sm text-purple-700">
                  {language === 'th'
                    ? 'ศิษยาภิบาลและทีมอธิษฐานของเราอธิษฐานเผื่อทุกคำอธิษฐานที่ได้รับ เราเชื่อในพลังแห่งการอธิษฐานและยืนเคียงข้างคุณในความเชื่อ'
                    : 'Our pastor and prayer team pray over every request received. We believe in the power of prayer and stand with you in faith.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Prayer Wall */}
          <div>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <Users className="h-5 w-5 text-purple-600" />
              {language === 'th' ? 'กำแพงอธิษฐาน' : 'Prayer Wall'}
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              {language === 'th'
                ? 'อธิษฐานเผื่อพี่น้องในชุมชนของเรา คลิก "ฉันอธิษฐานแล้ว" เพื่อแสดงการสนับสนุน'
                : 'Pray for our community members. Click "I Prayed" to show your support.'}
            </p>
            <div className="space-y-4">
              {publicPrayers.map((prayer) => (
                <Card key={prayer.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {language === 'th' ? prayer.categoryThai : prayer.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(prayer.date).toLocaleDateString(
                          language === 'th' ? 'th-TH' : 'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    <p className="mb-3 text-slate-700">{prayer.request}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">— {prayer.name}</span>
                      <Button
                        size="sm"
                        variant={prayedFor.includes(prayer.id) ? 'default' : 'outline'}
                        className={
                          prayedFor.includes(prayer.id)
                            ? 'bg-purple-600'
                            : 'border-purple-300 text-purple-600'
                        }
                        onClick={() => handlePrayFor(prayer.id)}
                        disabled={prayedFor.includes(prayer.id)}
                      >
                        <Heart
                          className={`mr-1 h-4 w-4 ${prayedFor.includes(prayer.id) ? 'fill-white' : ''}`}
                        />
                        {prayedFor.includes(prayer.id)
                          ? language === 'th'
                            ? 'อธิษฐานแล้ว'
                            : 'Prayed'
                          : language === 'th'
                            ? 'ฉันอธิษฐาน'
                            : 'I Prayed'}
                        <span className="ml-1">
                          ({prayer.prayerCount + (prayedFor.includes(prayer.id) ? 1 : 0)})
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
          <MessageCircle className="mx-auto mb-4 h-10 w-10" />
          <h2 className="mb-2 text-2xl font-bold">
            {language === 'th' ? 'ต้องการพูดคุยกับใครสักคน?' : 'Need to Talk to Someone?'}
          </h2>
          <p className="mb-6 text-purple-100">
            {language === 'th'
              ? 'ศิษยาภิบาลของเราพร้อมรับฟังและอธิษฐานร่วมกับคุณ'
              : 'Our pastor is available to listen and pray with you'}
          </p>
          <Link to="/#contact">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
              {language === 'th' ? 'ติดต่อศิษยาภิบาล' : 'Contact the Pastor'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6">
          <p>© 2026 Sing Buri Adventist Center. All rights reserved.</p>
        </div>
      </footer>
    </PublicLayout>
  );
}

export default PrayerPage;
