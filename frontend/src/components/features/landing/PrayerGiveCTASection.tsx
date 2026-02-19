/**
 * Prayer & Give CTA Section
 *
 * Warm, inviting call-to-action section linking to /prayer and /give pages.
 * Uses a split layout with glassmorphism cards over a warm gradient background.
 *
 * UI/UX Rationale:
 * - Homepage should inspire action, not host complex forms
 * - Warm gradient background contrasts the light sections above/below
 * - Two clean cards with focused copy + single CTA = higher conversion
 * - Bilingual (EN/TH) with emotional, community-focused messaging
 */

import { Link } from 'react-router';
import { Heart, Gift, ArrowRight, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { useI18n } from '@/i18n';

export function PrayerGiveCTASection() {
  const { language } = useI18n();
  const isEn = language !== 'th';

  return (
    <section
      id="prayer-give"
      className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-rose-900 py-20 sm:py-28"
      aria-label={isEn ? 'Prayer and giving' : 'อธิษฐานและถวาย'}
    >
      {/* Warm decorative background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-12 text-center sm:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-rose-200 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            {isEn ? 'Be Part of Something Greater' : 'มาร่วมเป็นส่วนหนึ่ง'}
          </div>
          <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {isEn ? 'How You Can Make a Difference' : 'คุณสามารถสร้างความแตกต่างได้'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-purple-200/80">
            {isEn
              ? 'Every prayer lifted and every gift given strengthens our church family and reaches those in need.'
              : 'ทุกคำอธิษฐานและทุกการถวายเสริมสร้างครอบครัวคริสตจักรของเราและเข้าถึงผู้ที่ต้องการ'}
          </p>
        </div>

        {/* Two CTA Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {/* Prayer Request Card */}
          <Link
            to="/prayer"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-8 backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/20 hover:bg-white/[0.12] hover:shadow-2xl hover:shadow-rose-500/10 sm:p-10"
          >
            {/* Decorative accent */}
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rose-500/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 shadow-lg shadow-rose-500/30">
                <HeartHandshake className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-bold text-white">
                {isEn ? 'Share a Prayer Request' : 'แบ่งปันคำขออธิษฐาน'}
              </h3>
              <p className="mb-2 text-base text-purple-200/90">
                {isEn
                  ? "You don't have to carry your burdens alone. Our prayer team is here for you."
                  : 'คุณไม่ต้องแบกรับภาระคนเดียว ทีมอธิษฐานของเราอยู่ที่นี่เพื่อคุณ'}
              </p>
              <p className="mb-8 text-sm italic text-purple-300/60">
                {isEn
                  ? '"Cast all your anxiety on Him because He cares for you." — 1 Peter 5:7'
                  : '"จงละความกังวลทั้งสิ้นของท่านไว้กับพระองค์ เพราะพระองค์ทรงห่วงใยท่าน" — 1 เปโตร 5:7'}
              </p>

              {/* CTA */}
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-rose-700 shadow-lg transition-[gap,box-shadow] duration-300 group-hover:gap-3 group-hover:shadow-xl">
                {isEn ? 'Submit Prayer Request' : 'ส่งคำขออธิษฐาน'}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              {/* Social proof */}
              <div className="mt-6 flex items-center gap-2 text-sm text-purple-300/60">
                <Heart className="h-3.5 w-3.5 fill-rose-400/50 text-rose-400/50" />
                {isEn
                  ? 'Confidential & cared for by our prayer team'
                  : 'เป็นความลับและดูแลโดยทีมอธิษฐานของเรา'}
              </div>
            </div>
          </Link>

          {/* Give / Support Card */}
          <Link
            to="/give"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-8 backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/20 hover:bg-white/[0.12] hover:shadow-2xl hover:shadow-amber-500/10 sm:p-10"
          >
            {/* Decorative accent */}
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 shadow-lg shadow-amber-500/30">
                <Gift className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-2xl font-bold text-white">
                {isEn ? 'Support Our Church Family' : 'สนับสนุนครอบครัวคริสตจักร'}
              </h3>
              <p className="mb-2 text-base text-purple-200/90">
                {isEn
                  ? 'Your generosity helps us serve our community and share hope with those around us.'
                  : 'ความเอื้อเฟื้อของคุณช่วยให้เรารับใช้ชุมชนและแบ่งปันความหวัง'}
              </p>
              <p className="mb-8 text-sm italic text-purple-300/60">
                {isEn
                  ? '"God loves a cheerful giver." — 2 Corinthians 9:7'
                  : '"พระเจ้าทรงรักคนที่ให้ด้วยใจยินดี" — 2 โครินธ์ 9:7'}
              </p>

              {/* CTA */}
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-amber-700 shadow-lg transition-[gap,box-shadow] duration-300 group-hover:gap-3 group-hover:shadow-xl">
                {isEn ? 'Give Now' : 'ถวายตอนนี้'}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              {/* Social proof */}
              <div className="mt-6 flex items-center gap-2 text-sm text-purple-300/60">
                <Users className="h-3.5 w-3.5 text-amber-400/50" />
                {isEn
                  ? 'PromptPay, bank transfer, or in person'
                  : 'พร้อมเพย์ โอนเงิน หรือถวายด้วยตนเอง'}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PrayerGiveCTASection;
