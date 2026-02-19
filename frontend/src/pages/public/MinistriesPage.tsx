/**
 * Ministries Page
 *
 * Overview of all church ministries with links to individual ministry pages
 */

import { Link } from 'react-router';
import { Users } from 'lucide-react';
import { ministryIconMap } from '@/constants/ministryIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ministries } from '@/data/ministries';

export function MinistriesPage() {
  const { language } = useI18n();
  useDocumentTitle('Our Ministries', 'แผนกพันธกิจ', language);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 pb-16 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Users className="mx-auto mb-4 h-12 w-12 text-blue-300" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'แผนกพันธกิจ' : 'Our Ministries'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-100">
            {language === 'th'
              ? 'ค้นพบวิธีที่คุณสามารถมีส่วนร่วมและเติบโตในความเชื่อของคุณ'
              : 'Discover ways you can get involved and grow in your faith'}
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => {
            const Icon = ministryIconMap[ministry.id] || Users;
            return (
              <Link key={ministry.id} to={`/ministries/${ministry.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={ministry.image}
                      alt={language === 'th' ? ministry.nameThai : ministry.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className={`absolute left-4 top-4 rounded-full ${ministry.color} p-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h2 className="mb-2 text-lg font-bold text-foreground group-hover:text-primary">
                      {language === 'th' ? ministry.nameThai : ministry.name}
                    </h2>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {language === 'th' ? ministry.descriptionThai : ministry.description}
                    </p>
                    {ministry.meetingTime && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">
                          {language === 'th' ? 'เวลาประชุม:' : 'Meeting:'}{' '}
                        </span>
                        {ministry.meetingTime}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">
            {language === 'th' ? 'พร้อมที่จะมีส่วนร่วม?' : 'Ready to Get Involved?'}
          </h2>
          <p className="mb-6 text-blue-100">
            {language === 'th'
              ? 'ติดต่อเราเพื่อเรียนรู้เพิ่มเติมเกี่ยวกับการเข้าร่วมแผนกพันธกิจใดๆ'
              : 'Contact us to learn more about joining any of our ministries'}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/#contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                {language === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
              </Button>
            </Link>
            <Link to="/visit">
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                {language === 'th' ? 'มาเยี่ยมชม' : 'Plan Your Visit'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default MinistriesPage;
