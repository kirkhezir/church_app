/**
 * Location Map Section Component - Enhanced
 *
 * Displays church location with embedded Google Maps and contact details
 *
 * UI/UX Best Practices:
 * - Clear visual hierarchy
 * - Easy-to-scan contact info
 * - Accessible map with fallback
 * - Mobile-responsive layout
 */

import { MapPin, Navigation, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';

export function LocationMapSection() {
  const googleMapsUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.800285887927!2d100.40142999999999!3d14.8924418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e1f18a81a744c7%3A0x867c5a12e90f0d17!2sSingburi%20Seventh%20Day%20Adventist%20(SDA)%20Center!5e0!3m2!1sen!2sth!4v1762180423839!5m2!1sen!2sth';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Singburi+Seventh+Day+Adventist+Center';

  return (
    <section id="location" className="bg-white py-16 sm:py-24" aria-labelledby="location-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h2 id="location-heading" className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Find Us
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;d love to see you! Here&apos;s how to reach us
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl bg-muted">
              <div className="aspect-video w-full">
                <iframe
                  title="Google Maps - Sing Buri Adventist Center"
                  src={googleMapsUrl}
                  width="100%"
                  height="100%"
                  className="border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            <Button
              className="mt-4 w-full bg-blue-600 font-medium text-white hover:bg-blue-700"
              onClick={() => window.open(directionsUrl, '_blank')}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Get Directions
            </Button>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 lg:col-span-2">
            {/* Address */}
            <div className="rounded-xl bg-muted p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Address</h3>
              </div>
              <address className="not-italic text-muted-foreground">
                <p className="font-medium text-foreground">Sing Buri Adventist Center</p>
                <p>Bang Phutsa, Mueang Sing Buri District,</p>
                <p>Sing Buri 16000 Thailand</p>
              </address>
            </div>

            {/* Phone */}
            <div className="rounded-xl bg-muted p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Phone</h3>
              </div>
              <a href="tel:+66876106926" className="font-medium text-blue-600 hover:underline">
                +66 (0) 876-106-926
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                Call us for any questions or to schedule a visit
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl bg-muted p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Email</h3>
              </div>
              <a
                href="mailto:singburiadventistcenter@gmail.com"
                className="break-all font-medium text-blue-600 hover:underline"
              >
                singburiadventistcenter@gmail.com
              </a>
              <p className="mt-1 text-sm text-muted-foreground">Send us a message anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationMapSection;
