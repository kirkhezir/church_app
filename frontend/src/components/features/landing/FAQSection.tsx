/**
 * FAQ Section Component
 *
 * Accordion-style FAQ section for common visitor questions
 * Uses shadcn/ui Accordion component
 */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { HelpCircle, MessageCircle } from 'lucide-react';
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
    <section className="bg-white px-4 py-20" id="faq">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Have Questions?</h2>
          <p className="text-xl text-gray-600">Find answers to common questions about our church</p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-xl border-2 border-gray-100 bg-gray-50 px-6 transition-all hover:border-blue-200 hover:bg-blue-50/50 data-[state=open]:border-blue-300 data-[state=open]:bg-blue-50"
            >
              <AccordionTrigger className="py-6 text-left text-lg font-semibold text-gray-900 hover:no-underline">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                    Q
                  </span>
                  <span className="pr-4">{item.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-relaxed text-gray-700">
                <div className="ml-11 border-l-2 border-blue-200 pl-4">{item.answer}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
          <MessageCircle className="mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-2xl font-bold">Still have questions?</h3>
          <p className="mb-6 text-blue-100">We'd love to hear from you! Reach out anytime.</p>
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50"
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
