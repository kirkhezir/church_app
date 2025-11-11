/**
 * Worship Times Section Component - Enhanced
 *
 * Displays Sabbath worship service times for Sing Buri Adventist Center
 * with improved visual design and UX
 */

import { Clock, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function WorshipTimesSection() {
  return (
    <section
      id="worship-times"
      className="bg-white px-4 py-16"
      aria-labelledby="worship-times-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 id="worship-times-heading" className="mb-4 text-4xl font-bold text-gray-900">
            Worship Times
          </h2>
          <p className="text-lg text-gray-600">Join us every Sabbath for worship and fellowship</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sabbath School */}
          <Card className="overflow-hidden border-none shadow-lg transition-all hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Saturday</span>
              </div>
              <CardTitle className="text-2xl">Sabbath School</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                <Clock className="h-8 w-8 text-blue-600" />
                <time dateTime="09:00">9:00 AM</time>
              </div>
              <p className="mt-4 text-gray-600">
                Bible study and fellowship for all ages. Small group discussions and interactive
                learning.
              </p>
            </CardContent>
          </Card>

          {/* Divine Service */}
          <Card className="overflow-hidden border-none shadow-lg transition-all hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Saturday</span>
              </div>
              <CardTitle className="text-2xl">Divine Service</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                <Clock className="h-8 w-8 text-purple-600" />
                <time dateTime="10:30">10:30 AM</time>
              </div>
              <p className="mt-4 text-gray-600">
                Worship service with inspiring music, prayer, and biblical messages.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-blue-600" />
          <p className="text-lg font-medium text-gray-900">
            All are welcome to join us in worship and fellowship!
          </p>
          <p className="mt-2 text-gray-600">
            First-time visitors, please feel free to introduce yourself. We'd love to meet you!
          </p>
        </div>
      </div>
    </section>
  );
}

export default WorshipTimesSection;
