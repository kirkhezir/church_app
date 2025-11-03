/**
 * Mission Statement Section Component
 *
 * Displays the church's mission and purpose
 */

export function MissionStatementSection() {
  return (
    <section className="bg-white px-4 py-16" aria-labelledby="mission-heading">
      <div className="mx-auto max-w-4xl">
        <h2 id="mission-heading" className="mb-8 text-center text-3xl font-bold text-gray-900">
          Our Mission
        </h2>

        <div className="prose prose-lg mx-auto text-gray-700">
          <p className="mb-6 text-center text-xl leading-relaxed">
            The Sing Buri Adventist Center is a community of faith dedicated to sharing the love of
            Christ and serving our local community. We believe in worship, fellowship, and spiritual
            growth through Bible study and prayer.
          </p>

          <p className="text-center leading-relaxed">
            Our church family welcomes all who seek to know God and grow in their relationship with
            Jesus Christ. We are committed to living out the teachings of Scripture and making a
            positive impact in Sing Buri and beyond.
          </p>
        </div>

        <div className="mt-10 grid gap-6 text-center md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Worship</h3>
            <p className="text-gray-600">
              Praising God together through song, prayer, and Scripture
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Community</h3>
            <p className="text-gray-600">
              Building lasting relationships and supporting one another in faith
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Service</h3>
            <p className="text-gray-600">Reaching out to our community with love and compassion</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MissionStatementSection;
