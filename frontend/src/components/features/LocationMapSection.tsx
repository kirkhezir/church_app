/**
 * Location Map Section Component - Enhanced
 *
 * Displays church location with embedded Google Maps and contact details
 */

import { MapPin, Navigation, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function LocationMapSection() {
  const googleMapsUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.800285887927!2d100.40142999999999!3d14.8924418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e1f18a81a744c7%3A0x867c5a12e90f0d17!2sSingburi%20Seventh%20Day%20Adventist%20(SDA)%20Center!5e0!3m2!1sen!2sth!4v1762180423839!5m2!1sen!2sth';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=Singburi+Seventh+Day+Adventist+Center';

  return (
    <section id="location" className="bg-white px-4 py-16" aria-labelledby="location-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 id="location-heading" className="mb-4 text-4xl font-bold text-gray-900">
            Find Us
          </h2>
          <p className="text-lg text-gray-600">We'd love to see you! Here's how to reach us</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-none shadow-xl">
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
            </Card>

            <div className="mt-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                onClick={() => window.open(directionsUrl, '_blank')}
              >
                <Navigation className="mr-2 h-5 w-5" />
                Get Directions
              </Button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Address</h3>
                </div>
                <address className="not-italic">
                  <p className="mb-2 text-lg font-semibold text-gray-900">
                    Sing Buri Adventist Center
                  </p>
                  <p className="text-gray-700">Bang Phutsa, Mueang Sing Buri District,</p>
                  <p className="text-gray-700"> Sing Buri 16000 Thailand</p>
                </address>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Phone</h3>
                </div>
                <a
                  href="tel:+66876106926"
                  className="text-lg text-blue-600 hover:text-blue-700 hover:underline"
                >
                  +66 (0) 876-106-926
                </a>
                <p className="mt-2 text-sm text-gray-600">
                  Call us for any questions or to schedule a visit
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Email</h3>
                </div>
                <a
                  href="mailto:singburiadventistcenter@gmail.com"
                  className="break-all text-lg text-blue-600 hover:text-blue-700 hover:underline"
                >
                  singburiadventistcenter@gmail.com
                </a>
                <p className="mt-2 text-sm text-gray-600">Send us a message anytime</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationMapSection;
