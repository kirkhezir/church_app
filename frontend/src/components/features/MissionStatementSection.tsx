/**
 * Mission Statement Section Component - Enhanced
 *
 * Displays the church's mission and core values with modern design
 */

import { Heart, Users, BookOpen, Church, Sparkles, Globe } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const CORE_VALUES = [
  {
    icon: Church,
    title: 'Worship',
    description: 'Praising God together through song, prayer, and Scripture',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building lasting relationships and supporting one another in faith',
  },
  {
    icon: Globe,
    title: 'Service',
    description: 'Reaching out to our community with love and compassion',
  },
  {
    icon: BookOpen,
    title: 'Growth',
    description: "Deepening our understanding of God's Word through study and reflection",
  },
  {
    icon: Heart,
    title: 'Love',
    description: "Demonstrating Christ's love in all we do and say",
  },
  {
    icon: Sparkles,
    title: 'Hope',
    description: 'Sharing the hope of salvation and eternal life with all',
  },
];

export function MissionStatementSection() {
  return (
    <section
      id="mission"
      className="bg-gradient-to-b from-white to-gray-50 px-4 py-16"
      aria-labelledby="mission-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 id="mission-heading" className="mb-4 text-balance text-4xl font-bold text-foreground">
            Our Mission
          </h2>
          <div className="mx-auto h-1 w-24 rounded bg-gradient-to-r from-primary to-purple-600"></div>
        </div>

        <div className="mx-auto mb-16 max-w-4xl">
          <Card className="border-none bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl">
            <CardContent className="p-8 md:p-12">
              <p className="mb-6 text-xl leading-relaxed md:text-2xl">
                The Sing Buri Adventist Center is a community of faith dedicated to sharing the love
                of Christ and serving our local community. We believe in worship, fellowship, and
                spiritual growth through Bible study and prayer.
              </p>
              <p className="text-lg leading-relaxed opacity-90 md:text-xl">
                Our church family welcomes all who seek to know God and grow in their relationship
                with Jesus Christ. We are committed to living out the teachings of Scripture and
                making a positive impact in Sing Buri and beyond.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 text-center">
          <h3 className="mb-4 text-3xl font-bold text-foreground">Our Core Values</h3>
          <p className="text-lg text-muted-foreground">
            The principles that guide our ministry and community
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CORE_VALUES.map((value, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-none shadow-lg transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg transition-transform group-hover:scale-110">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{value.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MissionStatementSection;
