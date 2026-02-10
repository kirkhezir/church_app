/**
 * Privacy Policy Page
 *
 * Legal compliance page for Sing Buri Adventist Center
 * Outlines data collection, usage, and protection practices
 */

import { Link } from 'react-router';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Mail, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function PrivacyPolicyPage() {
  const lastUpdated = 'January 28, 2026';

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-slate-600">Last updated: {lastUpdated}</p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="prose prose-slate max-w-none">
          {/* Introduction */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Introduction</h2>
            </div>
            <p className="text-slate-600">
              Sing Buri Adventist Center (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              respects your privacy and is committed to protecting your personal information. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website and use our services.
            </p>
            <p className="mt-4 text-slate-600">
              Please read this privacy policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the site.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Eye className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Information We Collect</h2>
            </div>

            <h3 className="mt-6 text-lg font-medium text-slate-900">Personal Information</h3>
            <p className="mt-2 text-slate-600">
              We may collect personal information that you voluntarily provide when you:
            </p>
            <ul className="mt-3 list-disc pl-6 text-slate-600">
              <li>Register as a member</li>
              <li>Subscribe to our newsletter</li>
              <li>Submit a contact form or prayer request</li>
              <li>RSVP for events</li>
              <li>Make a donation</li>
            </ul>
            <p className="mt-3 text-slate-600">
              This information may include your name, email address, phone number, mailing address,
              and any other information you choose to provide.
            </p>

            <h3 className="mt-6 text-lg font-medium text-slate-900">
              Automatically Collected Information
            </h3>
            <p className="mt-2 text-slate-600">
              When you visit our website, we may automatically collect certain information about
              your device and usage patterns, including:
            </p>
            <ul className="mt-3 list-disc pl-6 text-slate-600">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages viewed and time spent</li>
              <li>Referring website</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">How We Use Your Information</h2>
            </div>
            <p className="text-slate-600">We use the information we collect to:</p>
            <ul className="mt-3 list-disc pl-6 text-slate-600">
              <li>Provide, maintain, and improve our services</li>
              <li>Send you church announcements and newsletters (with your consent)</li>
              <li>Process event registrations and donations</li>
              <li>Respond to your inquiries and prayer requests</li>
              <li>Communicate with you about church activities</li>
              <li>Analyze usage patterns to improve our website</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Data Protection</h2>
            </div>
            <p className="text-slate-600">
              We implement appropriate technical and organizational security measures to protect
              your personal information against unauthorized access, alteration, disclosure, or
              destruction. These measures include:
            </p>
            <ul className="mt-3 list-disc pl-6 text-slate-600">
              <li>Encryption of data in transit (HTTPS)</li>
              <li>Secure storage with access controls</li>
              <li>Regular security assessments</li>
              <li>Staff training on data protection</li>
            </ul>
            <p className="mt-4 text-slate-600">
              However, no method of transmission over the Internet or electronic storage is 100%
              secure. While we strive to protect your information, we cannot guarantee absolute
              security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Your Rights</h2>
            </div>
            <p className="text-slate-600">You have the right to:</p>
            <ul className="mt-3 list-disc pl-6 text-slate-600">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-4 text-slate-600">
              To exercise any of these rights, please contact us using the information below.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Third-Party Services</h2>
            <p className="text-slate-600">
              Our website may contain links to third-party websites or services. We are not
              responsible for the privacy practices of these external sites. We encourage you to
              review the privacy policies of any third-party sites you visit.
            </p>
            <p className="mt-4 text-slate-600">We may use third-party services for:</p>
            <ul className="mt-3 list-disc pl-6 text-slate-600">
              <li>Payment processing (for donations)</li>
              <li>Email communications</li>
              <li>Website analytics</li>
              <li>Maps and location services</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Cookies and Tracking</h2>
            <p className="text-slate-600">
              We use cookies and similar technologies to enhance your experience on our website.
              Cookies are small files stored on your device that help us remember your preferences
              and understand how you use our site.
            </p>
            <p className="mt-4 text-slate-600">
              You can control cookies through your browser settings. Note that disabling cookies may
              affect some functionality of our website.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Children&apos;s Privacy</h2>
            <p className="text-slate-600">
              Our website is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12 rounded-xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Changes to This Policy</h2>
            <p className="text-slate-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last
              updated&quot; date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section className="rounded-xl bg-blue-50 p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
            </div>
            <p className="text-slate-600">
              If you have questions about this Privacy Policy or our data practices, please contact
              us:
            </p>
            <div className="mt-4 space-y-2 text-slate-700">
              <p>
                <strong>Sing Buri Adventist Center</strong>
              </p>
              <p>Bang Phutsa, Sing Buri 16000, Thailand</p>
              <p>
                Email:{' '}
                <a
                  href="mailto:singburiadventistcenter@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  singburiadventistcenter@gmail.com
                </a>
              </p>
              <p>Phone: +66 876-106-926</p>
            </div>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 text-center">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default PrivacyPolicyPage;
