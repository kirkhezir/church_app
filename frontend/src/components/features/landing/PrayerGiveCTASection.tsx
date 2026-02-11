/**
 * Prayer & Give CTA Section
 *
 * Lightweight call-to-action cards that link to dedicated pages.
 * Replaces the full PrayerRequestSection and GiveSection on the homepage
 * to reduce scroll depth and avoid duplicating functionality.
 *
 * UI/UX Rationale:
 * - Homepage should inspire action, not host complex forms
 * - Dedicated pages (/prayer, /give) provide the full experience
 * - Two side-by-side CTAs create visual balance with no wasted space
 * - Emotional imagery + short copy + single CTA per card = higher conversion
 */

import { Link } from 'react-router';
import { Heart, Gift, ArrowRight, Shield, Smartphone } from 'lucide-react';
import { Button } from '../../ui/button';

export function PrayerGiveCTASection() {
  return (
    <section
      id="prayer-give"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-20 sm:py-28"
      aria-label="Prayer and giving"
    >
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMEwzMCA2MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iMCAzMEw2MCAzMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] bg-repeat" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">
            Get Involved
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Connect With Us</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-200/80">
            Whether through prayer or generosity, every act of faith strengthens our community.
          </p>
        </div>

        {/* Two CTA Cards — side by side */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Prayer Request Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600/90 to-rose-700/90 p-8 shadow-2xl shadow-rose-900/30 backdrop-blur-sm transition-transform hover:scale-[1.02] sm:p-10">
            {/* Decorative glow */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:scale-150" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <Heart className="h-7 w-7 text-white" />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-white">Share Your Prayer Request</h3>

              <p className="mb-4 text-rose-100/90">
                &ldquo;Cast all your anxiety on Him because He cares for you.&rdquo;
              </p>
              <p className="mb-8 text-sm text-rose-200/80">— 1 Peter 5:7</p>

              <div className="mb-8 flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
                <p className="text-sm text-rose-100/80">
                  Our prayer team treats every request with care and confidentiality.
                </p>
              </div>

              <Link to="/prayer">
                <Button
                  size="lg"
                  className="group/btn w-full gap-2 bg-white text-rose-700 shadow-lg hover:bg-rose-50 sm:w-auto"
                >
                  Submit a Prayer Request
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Give / Support Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/90 to-amber-600/90 p-8 shadow-2xl shadow-amber-900/30 backdrop-blur-sm transition-transform hover:scale-[1.02] sm:p-10">
            {/* Decorative glow */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:scale-150" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <Gift className="h-7 w-7 text-white" />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-white">Support Our Ministry</h3>

              <p className="mb-4 text-amber-50/90">&ldquo;God loves a cheerful giver.&rdquo;</p>
              <p className="mb-8 text-sm text-amber-100/80">— 2 Corinthians 9:7</p>

              <div className="mb-8 flex items-start gap-3">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-100" />
                <p className="text-sm text-amber-50/80">
                  Give via PromptPay, bank transfer, or in person — every gift makes a difference.
                </p>
              </div>

              <Link to="/give">
                <Button
                  size="lg"
                  className="group/btn w-full gap-2 bg-white text-amber-700 shadow-lg hover:bg-amber-50 sm:w-auto"
                >
                  Give Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrayerGiveCTASection;
