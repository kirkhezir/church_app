/**
 * Visit Page
 *
 * Dedicated page for first-time visitors with comprehensive information
 * about what to expect when visiting the church.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Baby,
  Shirt,
  Car,
  Heart,
  HeartHandshake,
  Calendar,
  Phone,
  CheckCircle2,
  Send,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { PublicLayout } from '../../layouts';
import { useI18n } from '../../i18n';

// Calculate next Saturday date
function getNextSaturday(lang: string): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);

  if (today.getDay() === 6 && today.getHours() < 17) {
    return today.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const services = [
  {
    name: 'Sabbath School',
    time: '9:00 - 10:30 AM',
    description:
      'Interactive Bible study classes for all ages. Adults, youth, and children have separate classes with age-appropriate discussions.',
  },
  {
    name: 'Divine Service',
    time: '11:00 AM - 12:30 PM',
    description:
      'Our main worship service featuring praise music, prayer, special music, and a Bible-based sermon.',
  },
  {
    name: 'AY Program',
    time: '2:30 - 4:00 PM',
    description:
      'Adventist Youth program with activities, discussions, and fellowship for young people and families.',
  },
];

const visitInfoSections = [
  {
    icon: Heart,
    title: 'What to Expect',
    items: [
      'Friendly greeters will welcome you at the door',
      'Contemporary and traditional worship music',
      'Relevant Bible teaching for daily life',
      'Service typically lasts about 90 minutes',
      'Communion celebrated on certain Sabbaths',
    ],
  },
  {
    icon: Baby,
    title: "Children's Programs",
    items: [
      'Sabbath School classes for ages 0-17',
      'Safe, supervised environments',
      'Age-appropriate Bible lessons and activities',
      'Dedicated nursery available',
      'All volunteers are background-checked',
    ],
  },
  {
    icon: Shirt,
    title: 'What to Wear',
    items: [
      'No dress code — come comfortable',
      'Many wear smart casual or traditional attire',
      'Thai traditional dress is always welcome',
      'Focus is on worship, not appearance',
    ],
  },
  {
    icon: Car,
    title: 'Parking & Accessibility',
    items: [
      'Ample free parking on church grounds',
      'Accessible parking spaces available',
      'Motorcycle parking area provided',
      'Easy to find from main road',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'Connect With Us',
    items: [
      'Welcome desk with visitor information',
      'Meet our pastor and church family',
      'Receive a visitor welcome packet',
      'Learn about fellowship meals and small groups',
    ],
  },
];

export function VisitPage() {
  const { language } = useI18n();
  const nextSaturday = getNextSaturday(language);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 pb-12 pt-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                {language === 'th' ? 'วางแผนการมาเยี่ยมชม' : 'Plan Your Visit'}
              </h1>
              <p className="mt-2 text-lg text-blue-100">
                {language === 'th'
                  ? 'ทุกสิ่งที่คุณต้องรู้สำหรับการมาเยี่ยมครั้งแรก'
                  : 'Everything you need to know for a comfortable first visit'}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Calendar className="h-6 w-6" />
              <div>
                <p className="text-sm text-blue-100">
                  {language === 'th' ? 'วันสะบาโตถัดไป' : 'Next Sabbath'}
                </p>
                <p className="font-semibold">{nextSaturday}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Service Times */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Clock className="h-6 w-6 text-blue-600" />
            {language === 'th' ? 'เวลานมัสการ' : 'Service Times'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {services.map((service, index) => (
              <Card key={index} className="border-l-4 border-l-blue-600">
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                  <p className="mb-2 text-xl font-bold text-blue-600">{service.time}</p>
                  <p className="text-sm text-slate-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What to Know */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">What to Know Before You Come</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visitInfoSections.map((section, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Location & Contact - Improved Layout */}
        <section className="mb-12">
          {/* Map - Full width at top */}
          <Card className="mb-6 overflow-hidden">
            <div className="aspect-[21/9] bg-slate-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.800285887927!2d100.40142999999999!3d14.8924418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e1f18a81a744c7%3A0x867c5a12e90f0d17!2sSingburi%20Seventh%20Day%20Adventist%20(SDA)%20Center!5e0!3m2!1sen!2sth!4v1762180423839!5m2!1sen!2sth"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Church Location Map"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Sing Buri Adventist Center</p>
                    <p className="text-sm text-slate-600">Bang Phutsa, Sing Buri 16000, Thailand</p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    window.open(
                      'https://www.google.com/maps/dir/?api=1&destination=Singburi+Seventh+Day+Adventist+Center',
                      '_blank'
                    )
                  }
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {language === 'th' ? 'เส้นทาง' : 'Open in Google Maps'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info and Form - Side by side with equal height */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Have Questions? - Link to Contact */}
            <Card className="flex flex-col border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="flex flex-1 flex-col p-6">
                {/* Header with icon */}
                <div className="mb-auto">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
                    <MessageSquare className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">
                    {language === 'th' ? 'มีคำถาม?' : 'Have Questions?'}
                  </h3>
                  <p className="text-slate-600">
                    {language === 'th'
                      ? 'เราพร้อมช่วยเหลือคุณ! ดูข้อมูลติดต่อทั้งหมดรวมถึงโทรศัพท์ อีเมล LINE และที่อยู่ของเรา'
                      : "We're here to help! Find all our contact details including phone, email, LINE, and address."}
                  </p>
                </div>

                {/* Quick Contact Features */}
                <div className="my-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span>
                      {language === 'th' ? 'โทรศัพท์พร้อมรับสาย' : 'Phone support available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>{language === 'th' ? 'ติดต่อทาง LINE' : 'Contact via LINE'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-3">
                  <Link to="/#contact" className="block">
                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" size="lg">
                      {language === 'th' ? 'ดูข้อมูลติดต่อ' : 'View Contact Info'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>

                  {/* Quick contact options */}
                  <div className="flex gap-2">
                    <a href="tel:+66876106926" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-emerald-200 hover:bg-emerald-50"
                      >
                        <Phone className="h-4 w-4" />
                        {language === 'th' ? 'โทร' : 'Call'}
                      </Button>
                    </a>
                    <a
                      href="https://line.me/ti/p/@singburiadventist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2 border-emerald-200 hover:bg-emerald-50"
                      >
                        <MessageSquare className="h-4 w-4" />
                        LINE
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <Send className="h-5 w-5" />
                  {language === 'th' ? 'ส่งข้อความถึงเรา' : 'Send Us a Message'}
                </h3>

                {submitted ? (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-lg bg-emerald-50 p-8 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
                    <p className="text-lg font-medium text-emerald-700">
                      {language === 'th' ? 'ส่งข้อความสำเร็จ!' : 'Message sent successfully!'}
                    </p>
                    <p className="mt-2 text-sm text-emerald-600">
                      {language === 'th'
                        ? 'เราจะติดต่อกลับโดยเร็วที่สุด'
                        : "We'll get back to you soon."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">{language === 'th' ? 'ชื่อ' : 'Name'}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === 'th' ? 'ชื่อของคุณ' : 'Your name'}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{language === 'th' ? 'อีเมล' : 'Email'}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={language === 'th' ? 'อีเมลของคุณ' : 'your@email.com'}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        {language === 'th' ? 'เบอร์โทร (ไม่บังคับ)' : 'Phone (optional)'}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={language === 'th' ? 'เบอร์โทรศัพท์' : 'Your phone number'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">{language === 'th' ? 'ข้อความ' : 'Message'}</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={language === 'th' ? 'ข้อความของคุณ...' : 'Your message...'}
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {language === 'th' ? 'กำลังส่ง...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {language === 'th' ? 'ส่งข้อความ' : 'Send Message'}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-8">
              <h2 className="mb-2 text-2xl font-bold">
                {language === 'th' ? 'พร้อมมาเยี่ยมชม?' : 'Ready to Visit?'}
              </h2>
              <p className="mb-6 text-blue-100">
                {language === 'th'
                  ? 'เรารอพบคุณ! แล้วเจอกันวันสะบาโต'
                  : "We can't wait to meet you! See you this Sabbath."}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() =>
                    window.open(
                      'https://www.google.com/maps/dir/?api=1&destination=Singburi+Seventh+Day+Adventist+Center',
                      '_blank'
                    )
                  }
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {language === 'th' ? 'เส้นทาง' : 'Get Directions'}
                </Button>
                <a href="tel:+66876106926">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {language === 'th' ? 'โทรหาเรา' : 'Call Us'}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6">
          <p>© 2026 Sing Buri Adventist Center. All rights reserved.</p>
        </div>
      </footer>
    </PublicLayout>
  );
}

export default VisitPage;
