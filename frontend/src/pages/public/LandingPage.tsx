/**
 * Landing Page Component
 *
 * Public-facing landing page for Sing Buri Adventist Center
 * Displays hero section, worship times, location, mission, and contact form
 */

import WorshipTimesSection from '../../components/features/WorshipTimesSection';
import LocationMapSection from '../../components/features/LocationMapSection';
import MissionStatementSection from '../../components/features/MissionStatementSection';
import ContactForm from '../../components/features/ContactForm';

export function LandingPage() {
  return (
    <main className="container mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Sing Buri Adventist Center</h1>
          <p className="mb-6 text-2xl font-light md:text-3xl">ศูนย์แอ็ดเวนตีสท์สิงห์บุรี</p>
          <p className="text-xl leading-relaxed md:text-2xl">
            Welcome to our community of faith, hope, and love
          </p>
        </div>
      </section>

      {/* Worship Times */}
      <WorshipTimesSection />

      {/* Location Map */}
      <LocationMapSection />

      {/* Mission Statement */}
      <MissionStatementSection />

      {/* Contact Form */}
      <ContactForm />
    </main>
  );
}

export default LandingPage;
