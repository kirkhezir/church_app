/**
 * FAQ Section Component
 *
 * Accordion-style FAQ section for common visitor questions
 * Uses shadcn/ui Accordion component
 */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Button } from '../../ui/button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const faqItems: FAQItem[] = [
  {
    id: 'service-times',
    question: 'What time are your worship services?',
    answer:
      'Our Sabbath (Saturday) services begin with Sabbath School at 9:00 AM, followed by Divine Worship Service at 11:00 AM, and AY Service at 2:30 PM. We gather every Saturday to worship together.',
    category: 'Services',
  },
  {
    id: 'first-visit',
    question: 'What should I expect on my first visit?',
    answer:
      "You'll be warmly welcomed by our greeters at the door. Feel free to sit anywhere you're comfortable. Our service includes singing hymns, prayer, and a Bible-based sermon. Dress is modest and respectful - no need to be overly formal.",
    category: 'Visitors',
  },
  {
    id: 'dress-code',
    question: 'What should I wear?',
    answer:
      "We have no strict dress code. Most members dress in modest, comfortable attire. You'll see a mix of formal and casual wear. Come as you are - we're more interested in your heart than your wardrobe!",
    category: 'Visitors',
  },
  {
    id: 'children',
    question: 'Do you have programs for children?',
    answer:
      "Yes! We have Sabbath School classes for all ages, from toddlers to teens. Our children's programs include Bible stories, songs, crafts, and activities designed to help young ones learn about God in a fun, engaging way.",
    category: 'Programs',
  },
  {
    id: 'parking',
    question: 'Where can I park?',
    answer:
      'We have a dedicated parking area on the church premises. Our parking attendants are happy to help you find a spot. If our lot is full, street parking is available nearby.',
    category: 'Location',
  },
  {
    id: 'sabbath',
    question: 'Why do you worship on Saturday?',
    answer:
      "As Seventh-day Adventists, we observe the Sabbath on Saturday (the seventh day of the week) as instructed in the Bible. The Sabbath is a day of rest and worship, commemorating God's creation and His rest on the seventh day (Genesis 2:2-3, Exodus 20:8-11).",
    category: 'Beliefs',
  },
  {
    id: 'beliefs',
    question: 'What are your core beliefs?',
    answer:
      "We believe in the Bible as God's inspired Word, salvation through Jesus Christ, the Second Coming of Christ, and the gift of prophecy. We emphasize health, education, and service to others. We follow the 28 Fundamental Beliefs shared by Seventh-day Adventists worldwide.",
    category: 'Beliefs',
  },
  {
    id: 'join',
    question: 'How can I become a member?',
    answer:
      'We welcome all who wish to join our church family! The process typically includes attending our services, participating in Bible study classes, and baptism by immersion. Speak with our pastor or a church elder to learn more about your spiritual journey with us.',
    category: 'Membership',
  },
];

export function FAQSection() {
  return (
    <section className="bg-white py-16 sm:py-24" id="faq">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600">Common questions about visiting our church</p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-lg border border-slate-200 bg-white px-4 transition-colors data-[state=open]:bg-slate-50 sm:px-5"
            >
              <AccordionTrigger className="py-4 text-left font-medium text-slate-900 hover:no-underline sm:text-lg">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 leading-relaxed text-slate-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-10 rounded-xl bg-slate-100 p-6 text-center sm:p-8">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Still have questions?</h3>
          <p className="mb-4 text-slate-600">We'd love to hear from you!</p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
