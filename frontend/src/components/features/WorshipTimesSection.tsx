/**
 * Worship Times Section Component
 *
 * Displays Sabbath worship service times for Sing Buri Adventist Center
 */

export function WorshipTimesSection() {
  return (
    <section className="bg-white px-4 py-16" aria-labelledby="worship-times-heading">
      <div className="mx-auto max-w-4xl">
        <h2
          id="worship-times-heading"
          className="mb-8 text-center text-3xl font-bold text-gray-900"
        >
          Worship Times
        </h2>

        <div className="rounded-lg bg-gray-50 p-8 shadow-sm">
          <div className="text-center">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Sabbath Service</h3>
            <p className="mb-2 text-gray-700">
              <span className="font-medium">Saturday</span>
            </p>
            <p className="text-lg text-gray-900">
              <time dateTime="09:00">9:00 AM</time> - Sabbath School
            </p>
            <p className="text-lg text-gray-900">
              <time dateTime="10:30">10:30 AM</time> - Divine Service
            </p>
          </div>

          <div className="mt-6 text-center text-gray-600">
            <p>All are welcome to join us in worship and fellowship!</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorshipTimesSection;
