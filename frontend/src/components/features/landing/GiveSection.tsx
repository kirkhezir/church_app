/**
 * Give / Donate Section Component
 *
 * Provides donation options for the church
 * Supports Thai PromptPay and bank transfer
 *
 * UI/UX Best Practices:
 * - Clear giving options
 * - Thai-friendly payment methods (PromptPay)
 * - Transparent about fund usage
 * - Mobile-first QR code display
 */

import { useState } from 'react';
import {
  Heart,
  Gift,
  QrCode,
  Building2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';

interface GivingOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const givingOptions: GivingOption[] = [
  {
    id: 'promptpay',
    title: 'PromptPay',
    description: 'Instant transfer via Thai banking apps',
    icon: Smartphone,
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    description: 'Direct bank deposit',
    icon: Building2,
  },
];

// Church bank account details
const BANK_DETAILS = {
  bankName: 'Bangkok Bank',
  accountName: 'Sing Buri Adventist Center',
  accountNumber: '123-4-56789-0',
  branch: 'Sing Buri Branch',
};

// PromptPay ID (usually phone number or citizen ID)
const PROMPTPAY_ID = '0876106926';

const fundUsage = [
  { label: 'Ministry Programs', percentage: 40 },
  { label: 'Community Outreach', percentage: 25 },
  { label: 'Building & Maintenance', percentage: 20 },
  { label: 'Administration', percentage: 15 },
];

export function GiveSection() {
  const [selectedOption, setSelectedOption] = useState<string>('promptpay');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section
      id="give"
      className="bg-gradient-to-b from-amber-50 to-white py-16 sm:py-24"
      aria-labelledby="give-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 p-3">
            <Gift className="h-8 w-8 text-amber-600" />
          </div>
          <h2 id="give-heading" className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Support Our Ministry
          </h2>
          <p className="text-lg text-slate-600">
            &ldquo;Each of you should give what you have decided in your heart to give, not
            reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
          </p>
          <p className="mt-1 text-slate-500">— 2 Corinthians 9:7</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Giving Options Card */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Ways to Give
              </CardTitle>
              <CardDescription>Choose your preferred giving method</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {/* Option Tabs */}
              <div className="mb-6 flex gap-2">
                {givingOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      selectedOption === option.id
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.title}
                  </button>
                ))}
              </div>

              {/* PromptPay Option */}
              {selectedOption === 'promptpay' && (
                <div className="space-y-6">
                  {/* QR Code Placeholder */}
                  <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-inner">
                    <div className="mb-4 flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                      <div className="text-center">
                        <QrCode className="mx-auto h-16 w-16 text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500">PromptPay QR Code</p>
                        <p className="text-xs text-slate-400">Scan with banking app</p>
                      </div>
                    </div>

                    {/* PromptPay ID */}
                    <div className="mt-4 text-center">
                      <p className="text-sm text-slate-500">PromptPay ID</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">{PROMPTPAY_ID}</span>
                        <button
                          onClick={() => copyToClipboard(PROMPTPAY_ID, 'promptpay')}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Copy PromptPay ID"
                        >
                          {copiedField === 'promptpay' ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium text-blue-900">How to use PromptPay:</h4>
                    <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                      <li>Open your Thai banking app</li>
                      <li>Select &quot;Scan QR&quot; or &quot;PromptPay&quot;</li>
                      <li>Scan the QR code above or enter the ID</li>
                      <li>Confirm the recipient name matches</li>
                      <li>Enter the amount and complete the transfer</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Bank Transfer Option */}
              {selectedOption === 'bank' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{BANK_DETAILS.bankName}</p>
                        <p className="text-sm text-slate-500">{BANK_DETAILS.branch}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <div>
                          <p className="text-xs text-slate-500">Account Name</p>
                          <p className="font-medium text-slate-900">{BANK_DETAILS.accountName}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(BANK_DETAILS.accountName, 'name')}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          aria-label="Copy account name"
                        >
                          {copiedField === 'name' ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <div>
                          <p className="text-xs text-slate-500">Account Number</p>
                          <p className="font-mono text-lg font-bold text-slate-900">
                            {BANK_DETAILS.accountNumber}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(BANK_DETAILS.accountNumber.replace(/-/g, ''), 'account')
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          aria-label="Copy account number"
                        >
                          {copiedField === 'account' ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Please include your name in the transfer reference so
                      we can acknowledge your gift. For tax receipts, contact us with your transfer
                      details.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fund Usage & Info Card */}
          <div className="space-y-6">
            {/* Fund Usage */}
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle>How Your Gift is Used</CardTitle>
                <CardDescription>
                  Transparent stewardship of your generous contributions
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {fundUsage.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.percentage}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Giving */}
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <h3 className="mb-3 font-semibold text-slate-900">Special Giving Options</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                    <span>
                      <strong>Tithe:</strong> Return your faithful tithe through our church
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>
                      <strong>Building Fund:</strong> Support our facility improvements
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>
                      <strong>Mission Offering:</strong> Support global Adventist missions
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  For designated giving, include the fund name in your transfer reference.
                </p>
              </CardContent>
            </Card>

            {/* Questions */}
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="mb-3 text-sm text-slate-600">
                Questions about giving or need a receipt?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GiveSection;
