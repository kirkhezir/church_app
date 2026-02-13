/**
 * Give/Donate Page
 *
 * Multiple giving options, recurring donations, and donation history
 */

import { useState } from 'react';
import {
  Heart,
  CreditCard,
  Building2,
  QrCode,
  Gift,
  Repeat,
  CheckCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type GivingCategory = 'tithe' | 'offering' | 'missions' | 'building' | 'youth' | 'other';
type PaymentMethod = 'bank' | 'promptpay' | 'cash';

interface GivingOption {
  id: GivingCategory;
  name: string;
  nameThai: string;
  description: string;
  descriptionThai: string;
  icon: React.ElementType;
}

const givingOptions: GivingOption[] = [
  {
    id: 'tithe',
    name: 'Tithe',
    nameThai: 'สิบลด',
    description: "Return your faithful tithe to support God's work worldwide",
    descriptionThai: 'คืนสิบลดเพื่อสนับสนุนงานของพระเจ้าทั่วโลก',
    icon: Gift,
  },
  {
    id: 'offering',
    name: 'Church Budget',
    nameThai: 'งบประมาณโบสถ์',
    description: 'Support local church operations and ministries',
    descriptionThai: 'สนับสนุนการดำเนินงานและพันธกิจของโบสถ์ท้องถิ่น',
    icon: Building2,
  },
  {
    id: 'missions',
    name: 'World Missions',
    nameThai: 'มิชชั่นโลก',
    description: 'Help spread the gospel to unreached areas',
    descriptionThai: 'ช่วยเผยแพร่ข่าวประเสริฐไปยังพื้นที่ที่ยังไม่ได้รับ',
    icon: Heart,
  },
  {
    id: 'building',
    name: 'Building Fund',
    nameThai: 'กองทุนอาคาร',
    description: 'Contribute to church building improvements',
    descriptionThai: 'มีส่วนร่วมในการปรับปรุงอาคารโบสถ์',
    icon: Building2,
  },
  {
    id: 'youth',
    name: 'Youth Ministry',
    nameThai: 'พันธกิจเยาวชน',
    description: 'Support youth programs and activities',
    descriptionThai: 'สนับสนุนโปรแกรมและกิจกรรมเยาวชน',
    icon: Heart,
  },
  {
    id: 'other',
    name: 'Other',
    nameThai: 'อื่นๆ',
    description: 'Specify your giving purpose',
    descriptionThai: 'ระบุวัตถุประสงค์การถวาย',
    icon: Gift,
  },
];

interface BankAccount {
  bank: string;
  bankThai: string;
  accountName: string;
  accountNumber: string;
  logo: string;
}

const bankAccounts: BankAccount[] = [
  {
    bank: 'Kasikorn Bank',
    bankThai: 'ธนาคารกสิกรไทย',
    accountName: 'Sing Buri Adventist Center',
    accountNumber: 'xxx-x-xxxxx-x',
    logo: '🏦',
  },
  {
    bank: 'Bangkok Bank',
    bankThai: 'ธนาคารกรุงเทพ',
    accountName: 'Sing Buri Adventist Center',
    accountNumber: 'xxx-x-xxxxx-x',
    logo: '🏦',
  },
];

export function GivePage() {
  const { language } = useI18n();
  useDocumentTitle('Give', 'ถวาย', language);
  const [selectedCategory, setSelectedCategory] = useState<GivingCategory | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showFAQ, setShowFAQ] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [amountError, setAmountError] = useState('');

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setAmountError('');
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setAmountError(
        language === 'th'
          ? 'กรุณาระบุจำนวนเงินที่ถูกต้อง'
          : 'Please enter a valid amount greater than 0'
      );
      return;
    }
    // In production, this would process the donation
    setIsSubmitted(true);
  };

  const faqs = [
    {
      id: '1',
      q: 'What is tithe?',
      qThai: 'สิบลดคืออะไร?',
      a: 'Tithe is 10% of your income returned to God as an act of worship and acknowledgment that everything we have belongs to Him. It supports the worldwide work of the Seventh-day Adventist Church.',
      aThai:
        'สิบลดคือ 10% ของรายได้ของคุณที่คืนให้พระเจ้าเป็นการนมัสการและยอมรับว่าทุกสิ่งที่เรามีเป็นของพระองค์ มันสนับสนุนงานทั่วโลกของคริสตจักรเซเว่นเดย์แอดเวนติสต์',
    },
    {
      id: '2',
      q: 'How are offerings used?',
      qThai: 'เงินถวายใช้อย่างไร?',
      a: 'Offerings support various church ministries including local church operations, community outreach, youth programs, missions, and special projects. You can designate your offering for specific purposes.',
      aThai:
        'เงินถวายสนับสนุนพันธกิจต่างๆ ของโบสถ์รวมถึงการดำเนินงานของโบสถ์ท้องถิ่น การเข้าถึงชุมชน โปรแกรมเยาวชน มิชชั่น และโครงการพิเศษ คุณสามารถกำหนดการถวายสำหรับวัตถุประสงค์เฉพาะ',
    },
    {
      id: '3',
      q: 'Is my donation tax-deductible?',
      qThai: 'การบริจาคของฉันหักภาษีได้หรือไม่?',
      a: 'Please consult with a tax professional regarding donations in Thailand. We can provide receipts for your records upon request.',
      aThai:
        'กรุณาปรึกษาผู้เชี่ยวชาญด้านภาษีเกี่ยวกับการบริจาคในประเทศไทย เราสามารถให้ใบเสร็จสำหรับบันทึกของคุณเมื่อต้องการ',
    },
    {
      id: '4',
      q: 'Can I give anonymously?',
      qThai: 'ฉันสามารถถวายโดยไม่ระบุตัวตนได้หรือไม่?',
      a: "Yes, you can give anonymously. Simply don't include your name when making a bank transfer or use cash in the offering envelope without identification.",
      aThai:
        'ได้ คุณสามารถถวายโดยไม่ระบุตัวตน เพียงอย่าใส่ชื่อเมื่อโอนเงินผ่านธนาคารหรือใช้เงินสดในซองถวายโดยไม่ต้องระบุตัวตน',
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-700 via-orange-700 to-red-700 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Heart className="mx-auto mb-4 h-12 w-12 text-amber-200" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'ถวายและบริจาค' : 'Give & Donate'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-amber-100">
            {language === 'th'
              ? 'การถวายของคุณสนับสนุนงานของพระเจ้าในชุมชนของเราและทั่วโลก'
              : "Your giving supports God's work in our community and around the world"}
          </p>
          <p className="mt-4 text-sm italic text-amber-200">
            &quot;
            {language === 'th'
              ? 'การให้มีความสุขมากกว่าการรับ'
              : 'It is more blessed to give than to receive.'}
            &quot; - {language === 'th' ? 'กิจการ 20:35' : 'Acts 20:35'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {!isSubmitted ? (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Step 1: Select Category */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    {language === 'th' ? '1. เลือกประเภทการถวาย' : '1. Select Giving Category'}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {givingOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedCategory(option.id)}
                          className={`cursor-pointer rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                            selectedCategory === option.id
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon
                              className={`h-5 w-5 ${selectedCategory === option.id ? 'text-amber-600' : 'text-slate-400'}`}
                            />
                            <div>
                              <p className="font-medium text-slate-900">
                                {language === 'th' ? option.nameThai : option.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {language === 'th' ? option.descriptionThai : option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Enter Amount */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    {language === 'th' ? '2. จำนวนเงิน' : '2. Enter Amount'}
                  </h2>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleAmountChange(preset.toString())}
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${
                          amount === preset.toString()
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ฿{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">
                      ฿
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0"
                      className={`w-full rounded-lg border py-3 pl-8 pr-4 text-xl focus:outline-none focus:ring-2 ${
                        amountError
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200'
                      }`}
                      aria-invalid={!!amountError}
                      aria-describedby={amountError ? 'amount-error' : undefined}
                    />
                  </div>
                  {amountError && (
                    <p id="amount-error" className="mt-1 text-sm text-red-600" role="alert">
                      {amountError}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label
                      htmlFor="recurring"
                      className="flex items-center gap-1 text-sm text-slate-600"
                    >
                      <Repeat className="h-4 w-4" />
                      {language === 'th'
                        ? 'ถวายประจำทุกเดือน'
                        : 'Make this a recurring monthly gift'}
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Payment Method */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    {language === 'th' ? '3. วิธีการชำระเงิน' : '3. Payment Method'}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        paymentMethod === 'bank'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                      <p className="font-medium">
                        {language === 'th' ? 'โอนเงิน' : 'Bank Transfer'}
                      </p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        paymentMethod === 'promptpay'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <QrCode className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                      <p className="font-medium">PromptPay</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                        paymentMethod === 'cash'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Banknote className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                      <p className="font-medium">{language === 'th' ? 'เงินสด' : 'Cash'}</p>
                    </button>
                  </div>

                  {/* Payment Details */}
                  {paymentMethod === 'bank' && (
                    <div className="mt-6 space-y-4">
                      <p className="text-sm text-slate-600">
                        {language === 'th'
                          ? 'โอนเงินไปยังบัญชีใดบัญชีหนึ่งด้านล่าง:'
                          : 'Transfer to any of the accounts below:'}
                      </p>
                      {bankAccounts.map((account, i) => (
                        <div key={i} className="rounded-lg bg-slate-50 p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{account.logo}</span>
                            <span className="font-medium">
                              {language === 'th' ? account.bankThai : account.bank}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {language === 'th' ? 'ชื่อบัญชี:' : 'Account Name:'}{' '}
                            {account.accountName}
                          </p>
                          <p className="font-mono text-lg font-bold text-slate-900">
                            {account.accountNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {paymentMethod === 'promptpay' && (
                    <div className="mt-6 text-center">
                      <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4">
                        <div className="text-center">
                          <QrCode className="mx-auto h-16 w-16 text-slate-400" />
                          <p className="mt-2 text-xs text-slate-500">
                            {language === 'th'
                              ? 'QR Code จะแสดงที่นี่'
                              : 'QR Code will appear here'}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-600">
                        {language === 'th'
                          ? 'สแกน QR Code เพื่อชำระเงินผ่าน PromptPay'
                          : 'Scan QR Code to pay via PromptPay'}
                      </p>
                      <p className="mt-2 font-mono text-lg">
                        {language === 'th' ? 'หรือโอนไปที่:' : 'Or transfer to:'} xxx-xxx-xxxx
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="mt-6 rounded-lg bg-slate-50 p-4">
                      <p className="text-slate-600">
                        {language === 'th' ? (
                          <>
                            คุณสามารถถวายเงินสดได้ที่โบสถ์ในวันสะบาโต ใส่ซองถวายและระบุประเภทการถวาย
                            หรือมอบให้เหรัญญิกโบสถ์โดยตรง
                          </>
                        ) : (
                          <>
                            You can give cash at church on Sabbath. Place it in an offering envelope
                            and indicate the giving category, or give directly to the church
                            treasurer.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedCategory || !amount || !paymentMethod}
                className="w-full bg-amber-600 py-6 text-lg hover:bg-amber-700 disabled:bg-slate-300"
              >
                {paymentMethod === 'cash'
                  ? language === 'th'
                    ? 'บันทึกความตั้งใจถวาย'
                    : 'Record Giving Intent'
                  : language === 'th'
                    ? 'ยืนยันการถวาย'
                    : 'Confirm Donation'}
              </Button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Notice */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-900">
                        {language === 'th' ? 'การถวายที่ปลอดภัย' : 'Secure Giving'}
                      </h3>
                      <p className="mt-1 text-sm text-green-700">
                        {language === 'th'
                          ? 'ข้อมูลของคุณได้รับการปกป้องและเป็นความลับ'
                          : 'Your information is protected and confidential'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Other Ways to Give */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-4 font-bold text-slate-900">
                    {language === 'th' ? 'วิธีอื่นในการถวาย' : 'Other Ways to Give'}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Smartphone className="mt-0.5 h-4 w-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {language === 'th' ? 'แอปธนาคาร' : 'Mobile Banking'}
                        </p>
                        <p className="text-slate-500">
                          {language === 'th'
                            ? 'โอนผ่านแอปธนาคารของคุณ'
                            : 'Transfer via your bank app'}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CreditCard className="mt-0.5 h-4 w-4 text-amber-600" />
                      <div>
                        <p className="font-medium text-slate-900">AdventistGiving.org</p>
                        <p className="text-slate-500">
                          {language === 'th'
                            ? 'ถวายออนไลน์ผ่านเว็บไซต์ทั่วโลก'
                            : 'Give online through worldwide portal'}
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-4 font-bold text-slate-900">
                    {language === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
                  </h3>
                  <div className="space-y-2">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border-b border-slate-100 last:border-0">
                        <button
                          onClick={() => setShowFAQ(showFAQ === faq.id ? null : faq.id)}
                          className="flex w-full cursor-pointer items-center justify-between py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400"
                        >
                          <span className="font-medium text-slate-900">
                            {language === 'th' ? faq.qThai : faq.q}
                          </span>
                          {showFAQ === faq.id ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                        {showFAQ === faq.id && (
                          <p className="pb-3 text-sm text-slate-600">
                            {language === 'th' ? faq.aThai : faq.a}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="mx-auto max-w-lg py-12 text-center" role="status" aria-live="polite">
            <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {language === 'th' ? 'ขอบคุณสำหรับการถวาย!' : 'Thank You for Your Gift!'}
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              {language === 'th'
                ? 'การถวายของคุณจะช่วยสนับสนุนงานของพระเจ้าในชุมชนของเราและทั่วโลก'
                : "Your generosity helps support God's work in our community and around the world."}
            </p>
            <Card className="mb-8 text-left">
              <CardContent className="p-6">
                <h3 className="mb-4 font-bold text-slate-900">
                  {language === 'th' ? 'สรุปการถวาย' : 'Giving Summary'}
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">
                      {language === 'th' ? 'ประเภท:' : 'Category:'}
                    </dt>
                    <dd className="font-medium">
                      {
                        givingOptions.find((o) => o.id === selectedCategory)?.[
                          language === 'th' ? 'nameThai' : 'name'
                        ]
                      }
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">{language === 'th' ? 'จำนวน:' : 'Amount:'}</dt>
                    <dd className="font-medium">฿{(parseInt(amount) || 0).toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">
                      {language === 'th' ? 'วิธีชำระเงิน:' : 'Method:'}
                    </dt>
                    <dd className="font-medium">
                      {paymentMethod === 'bank'
                        ? language === 'th'
                          ? 'โอนเงิน'
                          : 'Bank Transfer'
                        : paymentMethod === 'promptpay'
                          ? 'PromptPay'
                          : language === 'th'
                            ? 'เงินสด'
                            : 'Cash'}
                    </dd>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">
                        {language === 'th' ? 'ความถี่:' : 'Frequency:'}
                      </dt>
                      <dd className="font-medium text-amber-600">
                        {language === 'th' ? 'รายเดือน' : 'Monthly'}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              {language === 'th' ? 'ถวายอีกครั้ง' : 'Give Again'}
            </Button>
          </div>
        )}

        {/* Giving Impact */}
        <div className="mt-16 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-bold">
              {language === 'th' ? 'ผลกระทบของการถวาย' : 'Your Giving Impact'}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-4xl font-bold">15+</p>
                <p className="text-amber-100">
                  {language === 'th' ? 'ครอบครัวที่ได้รับพร' : 'Families Blessed'}
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold">500+</p>
                <p className="text-amber-100">
                  {language === 'th' ? 'มื้ออาหารที่แจก' : 'Meals Distributed'}
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold">20+</p>
                <p className="text-amber-100">
                  {language === 'th' ? 'ผู้รับบัพติศมา' : 'Baptisms'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default GivePage;
