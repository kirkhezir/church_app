/**
 * FAQ Section Component
 *
 * Accordion-style FAQ section for common visitor questions
 * Uses shadcn/ui Accordion component
 * Shows 5 most common questions by default with "Show More" option
 */

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Button } from '../../ui/button';
import { ChevronDown, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  priority?: number; // Lower number = higher priority (shown first)
}

const faqItems: FAQItem[] = [
  {
    id: 'service-times',
    question: 'What time are your worship services?',
    answer:
      'Our Sabbath (Saturday) services begin with Sabbath School at 9:00 AM, followed by Divine Worship Service at 11:00 AM, and AY Service at 2:30 PM. We gather every Saturday to worship together.',
    category: 'Services',
    priority: 1,
  },
  {
    id: 'first-visit',
    question: 'What should I expect on my first visit?',
    answer:
      "You'll be warmly welcomed by our greeters at the door. Feel free to sit anywhere you're comfortable. Our service includes singing hymns, prayer, and a Bible-based sermon. Dress is modest and respectful - no need to be overly formal.",
    category: 'Visitors',
    priority: 2,
  },
  {
    id: 'dress-code',
    question: 'What should I wear?',
    answer:
      "We have no strict dress code. Most members dress in modest, comfortable attire. You'll see a mix of formal and casual wear. Come as you are - we're more interested in your heart than your wardrobe!",
    category: 'Visitors',
    priority: 3,
  },
  {
    id: 'children',
    question: 'Do you have programs for children?',
    answer:
      "Yes! We have Sabbath School classes for all ages, from toddlers to teens. Our children's programs include Bible stories, songs, crafts, and activities designed to help young ones learn about God in a fun, engaging way.",
    category: 'Programs',
    priority: 4,
  },
  {
    id: 'sabbath',
    question: 'Why do you worship on Saturday?',
    answer:
      "As Seventh-day Adventists, we observe the Sabbath on Saturday (the seventh day of the week) as instructed in the Bible. The Sabbath is a day of rest and worship, commemorating God's creation and His rest on the seventh day (Genesis 2:2-3, Exodus 20:8-11).",
    category: 'Beliefs',
    priority: 5,
  },
  {
    id: 'parking',
    question: 'Where can I park?',
    answer:
      'We have a dedicated parking area on the church premises. Our parking attendants are happy to help you find a spot. If our lot is full, street parking is available nearby.',
    category: 'Location',
    priority: 6,
  },
  {
    id: 'beliefs',
    question: 'What are your core beliefs?',
    answer:
      "We believe in the Bible as God's inspired Word, salvation through Jesus Christ, the Second Coming of Christ, and the gift of prophecy. We emphasize health, education, and service to others. We follow the 28 Fundamental Beliefs shared by Seventh-day Adventists worldwide.",
    category: 'Beliefs',
    priority: 7,
  },
  {
    id: 'join',
    question: 'How can I become a member?',
    answer:
      'We welcome all who wish to join our church family! The process typically includes attending our services, participating in Bible study classes, and baptism by immersion. Speak with our pastor or a church elder to learn more about your spiritual journey with us.',
    category: 'Membership',
    priority: 8,
  },
];

// Sort by priority and split into initial and expanded
const sortedFAQs = [...faqItems].sort((a, b) => (a.priority || 99) - (b.priority || 99));
const INITIAL_FAQ_COUNT = 5;

export function FAQSection() {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQs based on search
  const filteredFAQs = searchQuery
    ? sortedFAQs.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedFAQs;

  // Determine which FAQs to display
  const displayedFAQs = searchQuery
    ? filteredFAQs
    : showAll
      ? sortedFAQs
      : sortedFAQs.slice(0, INITIAL_FAQ_COUNT);

  const hasMoreFAQs = !searchQuery && sortedFAQs.length > INITIAL_FAQ_COUNT;

  return (
    <section className="bg-white py-16 sm:py-24" id="faq" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <h2
            id="faq-heading"
            className="mb-3 text-balance text-3xl font-bold text-foreground sm:text-4xl"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Common questions about visiting our church
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search questions\u2026"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Search frequently asked questions"
          />
        </div>

        {/* FAQ Accordion */}
        {displayedFAQs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-3">
            {displayedFAQs.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-lg border border-border bg-white px-4 transition-colors data-[state=open]:bg-muted sm:px-5"
              >
                <AccordionTrigger className="py-4 text-left font-medium text-foreground hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rounded-lg bg-muted p-8 text-center">
            <p className="text-muted-foreground">
              No questions found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-blue-600"
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Show More/Less Button */}
        {hasMoreFAQs && !searchQuery && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
              {showAll
                ? 'Show Less'
                : `Show ${sortedFAQs.length - INITIAL_FAQ_COUNT} More Questions`}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQSection;
