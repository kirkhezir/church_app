/**
 * Sermons static data
 *
 * Centralized sermon data for the Sermons and SermonDetail pages.
 * TODO: Replace with API call to sermonService.getAll() when backend is ready.
 */

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  description: string;
  scripture: string;
  youtubeId?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  series?: string;
}

export const sermons: Sermon[] = [
  {
    id: '1',
    title: 'The Power of Faith in Uncertain Times',
    speaker: 'Pastor Somchai',
    date: '2026-01-25',
    duration: '45 min',
    description:
      "Exploring how faith sustains us through life's challenges, drawing from Daniel's story. In this powerful message, Pastor Somchai takes us through the book of Daniel, showing how three young men stood firm in their faith even when facing a fiery furnace.\n\nKey takeaways:\n- Faith is not the absence of fear, but trusting God in spite of it\n- God doesn't always remove the fire, but He walks with us through it\n- Our faithfulness in small things prepares us for bigger tests\n- Community strengthens our individual faith\n\nThis sermon is part of the Faith Foundations series, designed to help believers build a strong spiritual foundation for everyday life.",
    scripture: 'Daniel 3:17-18',
    youtubeId: 'JG82QxIgb3Y',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=640&h=360&fit=crop&q=80',
    series: 'Faith Foundations',
  },
  {
    id: '2',
    title: 'Walking in the Light',
    speaker: 'Elder Prasert',
    date: '2026-01-18',
    duration: '38 min',
    description:
      "Understanding what it means to walk in God's light and be a light to others. Elder Prasert unpacks the practical implications of John's teaching about light and darkness.\n\nKey takeaways:\n- Walking in the light means living transparently before God\n- Fellowship with one another is a natural result of walking in light\n- The blood of Jesus continually cleanses us as we walk in the light\n- Being a light means letting Christ shine through our daily actions",
    scripture: '1 John 1:5-7',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=640&h=360&fit=crop&q=80',
    series: 'The Epistle of John',
  },
  {
    id: '3',
    title: 'The Sabbath Rest',
    speaker: 'Pastor Somchai',
    date: '2026-01-11',
    duration: '42 min',
    description:
      'Discovering the blessing and meaning of Sabbath rest in our busy modern lives. Pastor Somchai explores the Hebrew concept of rest and how the Sabbath is a gift from God for our physical, mental, and spiritual renewal.\n\nKey takeaways:\n- The Sabbath was made for humanity, not humanity for the Sabbath\n- True Sabbath rest involves ceasing from our own works and resting in God\n- The Sabbath points forward to the eternal rest we will experience in heaven\n- Keeping the Sabbath is an act of trust in God as our Provider',
    scripture: 'Hebrews 4:9-11',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=640&h=360&fit=crop&q=80',
    series: 'Foundations of Faith',
  },
  {
    id: '4',
    title: 'Grace That Transforms',
    speaker: 'Pastor Somchai',
    date: '2026-01-04',
    duration: '40 min',
    description:
      "Understanding God's transforming grace and how it changes our daily lives. In this message, we explore how grace is not just a one-time event at salvation, but a daily transforming power.\n\nKey takeaways:\n- Grace is unmerited favor — we cannot earn it\n- Grace doesn't just save us; it transforms us\n- Living in grace means extending grace to others\n- Grace empowers us to live differently",
    scripture: 'Ephesians 2:8-9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1445633883498-7f9922d37a3f?w=640&h=360&fit=crop&q=80',
    series: 'Foundations of Faith',
  },
  {
    id: '5',
    title: 'The Joy of Service',
    speaker: 'Elder Prasert',
    date: '2025-12-28',
    duration: '35 min',
    description:
      "Discovering joy in serving others as Jesus served us. Elder Prasert shares practical ways to serve in our community and explains why service brings such deep fulfillment.\n\nKey takeaways:\n- Jesus modeled servant leadership for us\n- True greatness in God's kingdom is measured by service\n- Service opportunities are all around us\n- Joy in service comes from losing ourselves for others",
    scripture: 'Mark 10:45',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=640&h=360&fit=crop&q=80',
    series: 'Living Like Jesus',
  },
  {
    id: '6',
    title: 'Hope for Tomorrow',
    speaker: 'Pastor Somchai',
    date: '2025-12-21',
    duration: '50 min',
    description:
      'The blessed hope of Christ\'s return and what it means for us today. This Advent-season message explores the promise of Jesus\' second coming and how this hope shapes our daily lives.\n\nKey takeaways:\n- The second coming is the "blessed hope" of every believer\n- This hope motivates holy living\n- We should live in readiness, not fear\n- The return of Christ will end all suffering and restore all things',
    scripture: 'Titus 2:13',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=640&h=360&fit=crop&q=80',
    series: 'Advent Hope',
  },
];

export const seriesList = [
  'All Series',
  'Faith Foundations',
  'The Epistle of John',
  'Foundations of Faith',
  'Living Like Jesus',
  'Advent Hope',
];

export const speakerList = ['All Speakers', 'Pastor Somchai', 'Elder Prasert'];
