/**
 * Bible Verse Widget
 *
 * Displays a weekly Bible verse based on ISO week number.
 * Uses a static rotation of 52 verses.
 */

import { memo } from 'react';
import { BookOpenText } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';

const WEEKLY_VERSES = [
  {
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    reference: 'John 3:16',
  },
  {
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    reference: 'Proverbs 3:5-6',
  },
  { text: 'I can do all this through him who gives me strength.', reference: 'Philippians 4:13' },
  { text: 'The Lord is my shepherd, I lack nothing.', reference: 'Psalm 23:1' },
  {
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    reference: 'Joshua 1:9',
  },
  {
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    reference: 'Romans 8:28',
  },
  {
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    reference: 'Isaiah 40:31',
  },
  {
    text: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?',
    reference: 'Psalm 27:1',
  },
  {
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
  },
  {
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    reference: 'Philippians 4:6',
  },
  {
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    reference: 'Jeremiah 29:11',
  },
  {
    text: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.',
    reference: 'Proverbs 18:10',
  },
  { text: 'Cast all your anxiety on him because he cares for you.', reference: '1 Peter 5:7' },
  {
    text: 'The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness.',
    reference: 'Zephaniah 3:17',
  },
  {
    text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    reference: 'Galatians 5:22-23',
  },
  {
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged.',
    reference: 'Joshua 1:9',
  },
  {
    text: 'God is our refuge and strength, an ever-present help in trouble.',
    reference: 'Psalm 46:1',
  },
  {
    text: 'Delight yourself in the Lord, and he will give you the desires of your heart.',
    reference: 'Psalm 37:4',
  },
  {
    text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    reference: 'Psalm 34:18',
  },
  {
    text: 'In their hearts humans plan their course, but the Lord establishes their steps.',
    reference: 'Proverbs 16:9',
  },
  { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10' },
  {
    text: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
    reference: '2 Corinthians 5:17',
  },
  {
    text: 'He gives strength to the weary and increases the power of the weak.',
    reference: 'Isaiah 40:29',
  },
  {
    text: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.',
    reference: 'Numbers 6:24-25',
  },
  {
    text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    reference: 'Hebrews 11:1',
  },
  {
    text: 'This is the day the Lord has made; let us rejoice and be glad in it.',
    reference: 'Psalm 118:24',
  },
  {
    text: 'The Lord is gracious and compassionate, slow to anger and rich in love.',
    reference: 'Psalm 145:8',
  },
  {
    text: 'For where two or three gather in my name, there am I with them.',
    reference: 'Matthew 18:20',
  },
  {
    text: 'Create in me a pure heart, O God, and renew a steadfast spirit within me.',
    reference: 'Psalm 51:10',
  },
  {
    text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.',
    reference: 'Galatians 6:9',
  },
  {
    text: 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.',
    reference: '2 Timothy 1:7',
  },
  {
    text: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.',
    reference: 'Lamentations 3:22-23',
  },
  {
    text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    reference: 'Matthew 6:33',
  },
  {
    text: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.',
    reference: 'Micah 6:8',
  },
  {
    text: 'Commit to the Lord whatever you do, and he will establish your plans.',
    reference: 'Proverbs 16:3',
  },
  {
    text: 'The Lord is my strength and my shield; my heart trusts in him, and he helps me.',
    reference: 'Psalm 28:7',
  },
  {
    text: 'Wait for the Lord; be strong and take heart and wait for the Lord.',
    reference: 'Psalm 27:14',
  },
  {
    text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',
    reference: '1 John 1:9',
  },
  {
    text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    reference: 'John 14:27',
  },
  {
    text: 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.',
    reference: 'John 15:5',
  },
  {
    text: 'Every good and perfect gift is from above, coming down from the Father of the heavenly lights.',
    reference: 'James 1:17',
  },
  {
    text: 'But the Lord is faithful, and he will strengthen you and protect you from the evil one.',
    reference: '2 Thessalonians 3:3',
  },
  {
    text: 'Above all, love each other deeply, because love covers over a multitude of sins.',
    reference: '1 Peter 4:8',
  },
  {
    text: 'The grass withers and the flowers fall, but the word of our God endures forever.',
    reference: 'Isaiah 40:8',
  },
  {
    text: 'Jesus said to her, "I am the resurrection and the life. The one who believes in me will live, even though they die."',
    reference: 'John 11:25',
  },
  {
    text: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
    reference: 'Philippians 4:19',
  },
  {
    text: 'How great is the love the Father has lavished on us, that we should be called children of God!',
    reference: '1 John 3:1',
  },
  {
    text: 'Thanks be to God! He gives us the victory through our Lord Jesus Christ.',
    reference: '1 Corinthians 15:57',
  },
  {
    text: 'The heavens declare the glory of God; the skies proclaim the work of his hands.',
    reference: 'Psalm 19:1',
  },
  {
    text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
    reference: 'Ephesians 2:10',
  },
  {
    text: 'Blessed is the one who trusts in the Lord, whose confidence is in him.',
    reference: 'Jeremiah 17:7',
  },
  {
    text: 'Great is the Lord and most worthy of praise; his greatness no one can fathom.',
    reference: 'Psalm 145:3',
  },
];

function getISOWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
}

export const BibleVerseWidget = memo(function BibleVerseWidget() {
  const weekNumber = getISOWeekNumber();
  const verse = WEEKLY_VERSES[(weekNumber - 1) % WEEKLY_VERSES.length];

  return (
    <Card className="border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:border-indigo-800/30 dark:from-indigo-950/20 dark:to-violet-950/10">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-400/10">
            <BookOpenText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600/70 dark:text-indigo-400/70">
              Verse of the Week
            </p>
            <blockquote className="mt-2 text-sm italic leading-relaxed text-foreground/90">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              — {verse.reference}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
