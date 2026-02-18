/**
 * Terms of Service Page
 *
 * Legal compliance page for Sing Buri Adventist Center
 * Outlines terms and conditions for using the website and services
 */

import { Link } from 'react-router';
import {
  ArrowLeft,
  FileText,
  Users,
  Scale,
  AlertTriangle,
  Globe,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PublicLayout } from '../../layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function TermsOfServicePage() {
  const lastUpdated = 'January 28, 2026';
  const { language } = useI18n();
  useDocumentTitle('Terms of Service', 'เงื่อนไขการใช้บริการ', language);

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 pb-12 pt-24 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {language === 'th' ? 'กลับหน้าแรก' : 'Back to Home'}
          </Link>
          <h1 className="mt-4 text-3xl font-bold">
            {language === 'th' ? 'เงื่อนไขการใช้บริการ' : 'Terms of Service'}
          </h1>
          <p className="mt-2 text-slate-300">
            {language === 'th' ? 'อัปเดตล่าสุด: 28 มกราคม 2026' : `Last updated: ${lastUpdated}`}
          </p>
          {language === 'th' && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              หมายเหตุ: เงื่อนไขการใช้บริการฉบับนี้จัดทำเป็นภาษาอังกฤษ
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="prose prose-slate max-w-none">
          {/* Agreement to Terms */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Agreement to Terms
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              By accessing or using the Sing Buri Adventist Center website and services, you agree
              to be bound by these Terms of Service. If you do not agree with any part of these
              terms, you may not access the website or use our services.
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              These Terms of Service apply to all visitors, users, and members who access our
              website and services, including the church management portal.
            </p>
          </section>

          {/* Use of Services */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Use of Services
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Our website provides information about church activities, events, and services. We
              also offer a member management portal for registered members. You agree to use our
              services only for lawful purposes and in accordance with these Terms.
            </p>

            <h3 className="mt-6 text-lg font-medium text-slate-900 dark:text-slate-100">
              You agree NOT to:
            </h3>
            <ul className="mt-3 list-disc pl-6 text-slate-600 dark:text-slate-400">
              <li>Use the service for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorized access to any portion of the website or any systems
              </li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Collect or harvest personal information of other users without their consent</li>
              <li>
                Impersonate another person or entity, or falsely state or misrepresent your
                affiliation
              </li>
              <li>Interfere with or disrupt the service or servers connected to the service</li>
            </ul>
          </section>

          {/* Member Accounts */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Member Accounts
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              When you create an account with us, you must provide accurate, complete, and current
              information. You are responsible for:
            </p>
            <ul className="mt-3 list-disc pl-6 text-slate-600 dark:text-slate-400">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Keeping your profile information up to date</li>
            </ul>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              We reserve the right to suspend or terminate accounts that violate these terms, with
              or without notice.
            </p>
          </section>

          {/* Content & Intellectual Property */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Content & Intellectual Property
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              The content on our website — including text, images, logos, sermon recordings, and
              other materials — is the property of Sing Buri Adventist Center unless otherwise
              stated. You may:
            </p>
            <ul className="mt-3 list-disc pl-6 text-slate-600 dark:text-slate-400">
              <li>View and download content for personal, non-commercial use</li>
              <li>Share content for ministry purposes with proper attribution</li>
              <li>Print materials for personal study or church group use</li>
            </ul>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              You may NOT reproduce, distribute, or create derivative works from our content for
              commercial purposes without written permission.
            </p>

            <h3 className="mt-6 text-lg font-medium text-slate-900 dark:text-slate-100">
              User-Generated Content
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              When you submit content such as prayer requests, messages, or comments, you grant us a
              non-exclusive, royalty-free right to use, display, and share that content within our
              church community. You are responsible for the content you submit and warrant that it
              does not violate the rights of others.
            </p>
          </section>

          {/* Donations */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <Scale className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Donations & Giving
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              All donations made through our website are voluntary. By making a donation, you
              acknowledge that:
            </p>
            <ul className="mt-3 list-disc pl-6 text-slate-600 dark:text-slate-400">
              <li>Donations are made freely and without expectation of goods or services</li>
              <li>
                Donations are generally non-refundable, unless made in error (contact us within 7
                days)
              </li>
              <li>We will provide donation receipts for record-keeping purposes upon request</li>
              <li>Donated funds will be used for the church's ministry and operational purposes</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Limitation of Liability
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Our website and services are provided &quot;as is&quot; and &quot;as available&quot;
              without warranties of any kind. Sing Buri Adventist Center shall not be liable for any
              indirect, incidental, special, or consequential damages arising out of or in
              connection with the use of our website or services.
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              We do not guarantee that the website will be uninterrupted, secure, or error-free. We
              are not responsible for any loss of data or content resulting from your use of the
              service.
            </p>
          </section>

          {/* External Links */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              External Links
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our website may contain links to third-party websites or services not owned or
              controlled by Sing Buri Adventist Center. We have no control over, and assume no
              responsibility for, the content or practices of any third-party sites. We encourage
              you to review the terms of service and privacy policies of any third-party sites you
              visit.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              These Terms shall be governed by and construed in accordance with the laws of the
              Kingdom of Thailand, without regard to its conflict of law provisions. Any disputes
              arising under these Terms shall be subject to the jurisdiction of the courts of
              Thailand.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Changes to These Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We reserve the right to modify or replace these Terms at any time. If we make material
              changes, we will notify users through a notice on our website. Your continued use of
              the service after changes constitute acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Contact Us
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Sing Buri Adventist Center</strong>
              </p>
              <p>Bang Phutsa, Sing Buri 16000, Thailand</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:singburiadventistcenter@gmail.com"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  singburiadventistcenter@gmail.com
                </a>
              </p>
              <p>Phone: +66 876-106-926</p>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {language === 'th' ? 'กลับหน้าแรก' : 'Back to Home'}
            </Button>
          </Link>
          <Link to="/privacy">
            <Button variant="outline" size="lg" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              {language === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

export default TermsOfServicePage;
