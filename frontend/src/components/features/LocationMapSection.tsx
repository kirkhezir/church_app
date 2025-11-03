/**
 * Location Map Section Component
 *
 * Displays church location with embedded Google Maps and address
 */

export function LocationMapSection() {
  return (
    <section className="bg-gray-50 px-4 py-16" aria-labelledby="location-heading">
      <div className="mx-auto max-w-4xl">
        <h2 id="location-heading" className="mb-8 text-center text-3xl font-bold text-gray-900">
          Find Us
        </h2>

        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          {/* Google Maps Embed */}
          <div className="aspect-video w-full">
            <iframe
              title="Google Maps - Sing Buri Adventist Center"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3850.1!2d100.4!3d14.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDUzJzU5LjQiTiAxMDDCsDIzJzU5LjQiRQ!5e0!3m2!1sen!2sth!4v1234567890"
              width="100%"
              height="100%"
              className="border-0"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Address Information */}
          <div className="p-6">
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Sing Buri Adventist Center</h3>
            <address className="space-y-1 not-italic text-gray-700">
              <p>Sing Buri Province</p>
              <p>สิงห์บุรี</p>
              <p>Thailand</p>
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationMapSection;
