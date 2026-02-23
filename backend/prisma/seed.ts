import { PrismaClient, Role, EventCategory, Priority, RSVPStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Thai names for realistic data
const thaiFirstNames = [
  'Somchai',
  'Sombat',
  'Somying',
  'Pranee',
  'Duangjai',
  'Nittaya',
  'Wichai',
  'Siriporn',
  'Thawatchai',
  'Anong',
  'Preecha',
  'Rattana',
  'Chokchai',
  'Malai',
  'Kittisak',
  'Pensri',
  'Surasak',
  'Wilaiwan',
  'Boonmee',
  'Kamolwan',
];

const thaiLastNames = [
  'Chaiyasit',
  'Srisawat',
  'Thongsuk',
  'Boonruang',
  'Wongsuwan',
  'Jaturaphat',
  'Phongsawat',
  'Tangsrirat',
  'Suttikul',
  'Charoenwong',
  'Petchsri',
  'Rungrueang',
  'Sirichok',
  'Prasert',
  'Mongkhon',
  'Wongsawat',
  'Pinkaew',
  'Suwannarat',
];

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🗑️  Clearing existing data...');
    await prisma.user_sessions.deleteMany();
    await prisma.push_subscriptions.deleteMany();
    await prisma.audit_logs.deleteMany();
    await prisma.member_announcement_views.deleteMany();
    await prisma.messages.deleteMany();
    await prisma.announcements.deleteMany();
    await prisma.event_rsvps.deleteMany();
    await prisma.events.deleteMany();
    await prisma.members.deleteMany();
    // CMS models
    await prisma.sermons.deleteMany();
    await prisma.blog_posts.deleteMany();
    await prisma.gallery_items.deleteMany();
    await prisma.prayer_requests.deleteMany();
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.members.create({
    data: {
      id: randomUUID(),
      updatedAt: new Date(),
      email: 'admin@singburi-adventist.org',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+66812345678',
      address: '123 Church Street, Sing Buri, Thailand',
      dateOfBirth: new Date('1975-05-15'), // Age 50+
      role: Role.ADMIN,
      membershipDate: new Date('2020-01-01'),
      privacySettings: {
        showPhone: true,
        showEmail: true,
        showAddress: true,
      },
      emailNotifications: true,
      mfaEnabled: false,
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create staff user
  console.log('👤 Creating staff user...');
  const staffPasswordHash = await bcrypt.hash('Staff123!', 10);
  const staff = await prisma.members.create({
    data: {
      id: randomUUID(),
      updatedAt: new Date(),
      email: 'staff@singburi-adventist.org',
      passwordHash: staffPasswordHash,
      firstName: 'Staff',
      lastName: 'Member',
      phone: '+66823456789',
      dateOfBirth: new Date('1988-08-20'), // Age 37
      role: Role.STAFF,
      membershipDate: new Date('2021-06-15'),
      privacySettings: {
        showPhone: false,
        showEmail: true,
        showAddress: false,
      },
      emailNotifications: true,
      mfaEnabled: false,
    },
  });
  console.log(`✅ Created staff: ${staff.email}`);

  // Create regular members
  console.log('👥 Creating regular members...');
  const memberPasswordHash = await bcrypt.hash('Member123!', 10);

  const members = await Promise.all([
    prisma.members.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        email: 'john.doe@example.com',
        passwordHash: memberPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+66834567890',
        address: '456 Main Road, Sing Buri, Thailand',
        dateOfBirth: new Date('1995-03-25'), // Age 30
        role: Role.MEMBER,
        membershipDate: new Date('2022-03-10'),
        privacySettings: {
          showPhone: true,
          showEmail: false,
          showAddress: false,
        },
        emailNotifications: true,
      },
    }),
    prisma.members.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        email: 'jane.smith@example.com',
        passwordHash: memberPasswordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+66845678901',
        dateOfBirth: new Date('2000-07-12'), // Age 25
        role: Role.MEMBER,
        membershipDate: new Date('2023-01-20'),
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
        emailNotifications: true,
      },
    }),
    prisma.members.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        email: 'peter.pan@example.com',
        passwordHash: memberPasswordHash,
        firstName: 'Peter',
        lastName: 'Pan',
        phone: '+66856789012',
        dateOfBirth: new Date('2010-11-30'), // Age 15 (youth)
        role: Role.MEMBER,
        membershipDate: new Date('2023-05-15'),
        privacySettings: {
          showPhone: true,
          showEmail: true,
          showAddress: false,
        },
        emailNotifications: false,
      },
    }),
  ]);
  console.log(`✅ Created ${members.length} regular members`);

  // Generate diverse ages for Thai members
  const birthYears = [
    1955,
    1960,
    1965,
    1970,
    1975, // 61+ group
    1980,
    1985,
    1978, // 46-60 group
    1990,
    1992,
    1995, // 31-45 group
    1998,
    2000,
    2002,
    2005, // 18-30 group
  ];

  // Create additional members with Thai names for more realistic data
  console.log('👥 Creating additional Thai members...');
  const additionalMembers = [];
  for (let i = 0; i < 15; i++) {
    const firstName = thaiFirstNames[i % thaiFirstNames.length];
    const lastName = thaiLastNames[i % thaiLastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const membershipYear = 2020 + Math.floor(i / 5);
    const membershipMonth = (i % 12) + 1;
    const birthYear = birthYears[i % birthYears.length];

    additionalMembers.push(
      prisma.members.create({
        data: {
          id: randomUUID(),
          updatedAt: new Date(),
          email,
          passwordHash: memberPasswordHash,
          firstName,
          lastName,
          phone: `+6680${String(1000000 + i).slice(1)}`,
          address: `${100 + i * 10} ${['Pracha', 'Sombun', 'Chai'][i % 3]} Road, Sing Buri, Thailand`,
          dateOfBirth: new Date(
            `${birthYear}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`
          ),
          role: Role.MEMBER,
          membershipDate: new Date(
            `${membershipYear}-${String(membershipMonth).padStart(2, '0')}-15`
          ),
          privacySettings: {
            showPhone: i % 2 === 0,
            showEmail: i % 3 === 0,
            showAddress: i % 4 === 0,
          },
          emailNotifications: i % 2 === 0,
        },
      })
    );
  }
  const allAdditionalMembers = await Promise.all(additionalMembers);
  console.log(`✅ Created ${allAdditionalMembers.length} additional members`);

  // Combine all members for easier access
  const allMembers = [...members, ...allAdditionalMembers];

  // Create events
  console.log('📅 Creating events...');
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly worship service with inspiring music and messages.',
        startDateTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        location: 'Sing Buri Adventist Church Sanctuary',
        category: EventCategory.WORSHIP,
        maxCapacity: 100,
        createdById: admin.id,
      },
    }),
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Bible Study Group',
        description: 'Deep dive into the Book of Acts. All are welcome!',
        startDateTime: new Date(nextWeek.setHours(19, 0, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(20, 30, 0, 0)),
        location: 'Church Fellowship Hall',
        category: EventCategory.BIBLE_STUDY,
        maxCapacity: 30,
        createdById: staff.id,
      },
    }),
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Community Outreach Day',
        description: 'Serving our local community with food distribution and clothing donations.',
        startDateTime: new Date(nextMonth.setHours(9, 0, 0, 0)),
        endDateTime: new Date(nextMonth.setHours(15, 0, 0, 0)),
        location: 'Sing Buri Community Center',
        category: EventCategory.COMMUNITY,
        maxCapacity: 50,
        createdById: admin.id,
      },
    }),
  ]);

  // Create more events for a fuller calendar
  console.log('📅 Creating additional events...');
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const threeWeeks = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  const additionalEvents = await Promise.all([
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Youth Fellowship Night',
        description:
          'Fun games, music, and discussion for our youth members (ages 13-25). Bring a friend!',
        startDateTime: new Date(twoWeeks.setHours(18, 0, 0, 0)),
        endDateTime: new Date(twoWeeks.setHours(21, 0, 0, 0)),
        location: 'Church Youth Center',
        category: EventCategory.FELLOWSHIP,
        maxCapacity: 40,
        createdById: staff.id,
      },
    }),
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Sabbath Afternoon Potluck',
        description: 'Join us for a fellowship lunch after service. Please bring a dish to share!',
        startDateTime: new Date(nextWeek.setHours(13, 0, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(15, 0, 0, 0)),
        location: 'Church Fellowship Hall',
        category: EventCategory.FELLOWSHIP,
        maxCapacity: 80,
        createdById: admin.id,
      },
    }),
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Prayer Meeting',
        description: 'Mid-week prayer and devotion. Come strengthen your faith with us.',
        startDateTime: new Date(twoWeeks.setHours(19, 0, 0, 0)),
        endDateTime: new Date(twoWeeks.setHours(20, 0, 0, 0)),
        location: 'Church Prayer Room',
        category: EventCategory.WORSHIP,
        maxCapacity: 25,
        createdById: staff.id,
      },
    }),
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Health & Wellness Seminar',
        description:
          'Learn about healthy living principles. Topics include nutrition, exercise, and mental health.',
        startDateTime: new Date(threeWeeks.setHours(14, 0, 0, 0)),
        endDateTime: new Date(threeWeeks.setHours(17, 0, 0, 0)),
        location: 'Church Multipurpose Hall',
        category: EventCategory.COMMUNITY,
        maxCapacity: 60,
        createdById: admin.id,
      },
    }),
    prisma.events.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: "Women's Ministry Meeting",
        description:
          "Monthly gathering for women. This month's topic: Finding Peace in Busy Times.",
        startDateTime: new Date(nextMonth.setHours(10, 0, 0, 0)),
        endDateTime: new Date(nextMonth.setHours(12, 0, 0, 0)),
        location: 'Church Chapel',
        category: EventCategory.FELLOWSHIP,
        maxCapacity: 35,
        createdById: staff.id,
      },
    }),
  ]);

  const allEvents = [...events, ...additionalEvents];
  console.log(`✅ Created ${allEvents.length} total events`);

  // Create RSVPs - more realistic distribution
  console.log('✅ Creating RSVPs...');
  const rsvpPromises = [];

  // Add RSVPs for each event with varying attendance
  for (let eventIndex = 0; eventIndex < allEvents.length; eventIndex++) {
    const event = allEvents[eventIndex];
    const numRsvps = Math.min(allMembers.length, 5 + Math.floor(Math.random() * 10));

    for (let i = 0; i < numRsvps; i++) {
      const memberIndex = (eventIndex + i) % allMembers.length;
      const statuses = [
        RSVPStatus.CONFIRMED,
        RSVPStatus.CONFIRMED,
        RSVPStatus.CONFIRMED,
        RSVPStatus.WAITLISTED,
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      rsvpPromises.push(
        prisma.event_rsvps
          .create({
            data: {
              eventId: event.id,
              memberId: allMembers[memberIndex].id,
              status,
            },
          })
          .catch(() => {
            // Ignore duplicates
          })
      );
    }
  }
  await Promise.all(rsvpPromises);
  console.log('✅ Created RSVPs for events');

  // Create announcements
  console.log('📢 Creating announcements...');
  const announcements = await Promise.all([
    prisma.announcements.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Welcome to Our New Church Management System!',
        content: `We are excited to announce the launch of our new church management system. 
        
This platform will help us stay connected as a church family. You can now:
- View and RSVP to upcoming events
- Read important announcements
- Connect with other members
- Manage your profile and privacy settings

Please take a moment to update your profile and explore the features!`,
        priority: Priority.URGENT,
        authorId: admin.id,
      },
    }),
    prisma.announcements.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Upcoming Community Outreach Event',
        content: `Join us next month for our community outreach day! We'll be serving our local community with food distribution and clothing donations. 

Volunteers are needed! Please RSVP to the event if you can help.

What to bring:
- Comfortable clothes
- Water bottle
- Servant's heart!`,
        priority: Priority.NORMAL,
        authorId: staff.id,
      },
    }),
    prisma.announcements.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Sabbath School Classes Resume',
        content: `Dear church family,

Sabbath School classes will resume this Saturday at 9:30 AM. We have classes available for all age groups:
- Children (ages 0-12)
- Youth (ages 13-18)
- Young Adults (ages 19-35)
- Adults

Teachers and assistants needed for children's classes. Please contact the church office if you can help.

See you on Sabbath!`,
        priority: Priority.NORMAL,
        authorId: admin.id,
      },
    }),
    prisma.announcements.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Church Building Maintenance Notice',
        content: `Please be advised that the church building will undergo maintenance work on Monday and Tuesday of next week.

During this time:
- The main sanctuary will be closed
- Office hours will be limited (10 AM - 2 PM)
- Prayer meetings will be held in the fellowship hall

We apologize for any inconvenience and appreciate your understanding.`,
        priority: Priority.NORMAL,
        authorId: admin.id,
      },
    }),
    prisma.announcements.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        title: 'Health Screening Available',
        content: `Free health screening will be available after service this Sabbath!

Services include:
- Blood pressure check
- Blood sugar test
- BMI measurement
- Health consultation

Brought to you by our Health Ministries team. No appointment necessary.

"Beloved, I wish above all things that thou mayest prosper and be in health" - 3 John 1:2`,
        priority: Priority.NORMAL,
        authorId: staff.id,
      },
    }),
  ]);
  console.log(`✅ Created ${announcements.length} announcements`);

  // Create announcement views
  console.log('👁️ Creating announcement views...');
  const viewPromises = [];
  for (const announcement of announcements) {
    const numViews = 3 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numViews && i < allMembers.length; i++) {
      viewPromises.push(
        prisma.member_announcement_views
          .create({
            data: {
              memberId: allMembers[i].id,
              announcementId: announcement.id,
              viewedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            },
          })
          .catch(() => {
            // Ignore duplicates
          })
      );
    }
  }
  await Promise.all(viewPromises);
  console.log('✅ Created announcement views');

  // Create sample messages
  console.log('💬 Creating sample messages...');
  const messagePromises = [
    prisma.messages.create({
      data: {
        id: randomUUID(),
        senderId: members[0].id,
        recipientId: members[1].id,
        subject: 'Welcome to the church!',
        body: 'Hi Jane! Welcome to our church family. Looking forward to getting to know you better! Let me know if you have any questions about our programs.',
      },
    }),
    prisma.messages.create({
      data: {
        id: randomUUID(),
        senderId: members[1].id,
        recipientId: members[0].id,
        subject: 'Re: Welcome to the church!',
        body: "Thank you so much, John! Everyone has been so welcoming. I'm excited to join the Bible study group. See you on Sabbath!",
        isRead: true,
        readAt: new Date(),
      },
    }),
    prisma.messages.create({
      data: {
        id: randomUUID(),
        senderId: admin.id,
        recipientId: staff.id,
        subject: 'Event Planning Meeting',
        body: "Hi, can we schedule a meeting to discuss the upcoming community outreach event? I'd like to review the volunteer list and logistics.",
      },
    }),
    prisma.messages.create({
      data: {
        id: randomUUID(),
        senderId: staff.id,
        recipientId: admin.id,
        subject: 'Re: Event Planning Meeting',
        body: "Sure! How about Tuesday at 2 PM? I'll prepare the volunteer signup sheet and the food distribution plan.",
        isRead: true,
        readAt: new Date(),
      },
    }),
    prisma.messages.create({
      data: {
        id: randomUUID(),
        senderId: members[2].id,
        recipientId: staff.id,
        subject: 'Question about Bible Study',
        body: "Hello! I'm interested in joining the Bible Study group. Is it open to new members? Do I need to bring anything?",
      },
    }),
  ];

  await Promise.all(messagePromises);
  console.log('✅ Created sample messages');

  // ============================================================================
  // CMS Content Seed Data (Phase 12)
  // ============================================================================

  // Seed Sermons (from frontend/src/data/sermons.ts)
  console.log('🎤 Creating sermons...');
  const sermonsData = [
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'The Power of Faith in Uncertain Times',
      titleThai: 'พลังแห่งความเชื่อในยามไม่แน่นอน',
      speaker: 'Pastor Somchai',
      speakerThai: 'ศจ. สมชาย',
      series: 'Faith Foundations',
      scripture: 'Daniel 3:17-18',
      date: new Date('2026-01-25'),
      youtubeUrl: 'https://www.youtube.com/watch?v=JG82QxIgb3Y',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=640&h=360&fit=crop&q=80',
      duration: '45 min',
      description:
        "Exploring how faith sustains us through life's challenges, drawing from Daniel's story. In this powerful message, Pastor Somchai takes us through the book of Daniel, showing how three young men stood firm in their faith even when facing a fiery furnace.\n\nKey takeaways:\n- Faith is not the absence of fear, but trusting God in spite of it\n- God doesn't always remove the fire, but He walks with us through it\n- Our faithfulness in small things prepares us for bigger tests\n- Community strengthens our individual faith\n\nThis sermon is part of the Faith Foundations series, designed to help believers build a strong spiritual foundation for everyday life.",
      views: 124,
      isPublished: true,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Walking in the Light',
      titleThai: 'ดำเนินในความสว่าง',
      speaker: 'Elder Prasert',
      speakerThai: 'ผู้ปกครอง ประเสริฐ',
      series: 'The Epistle of John',
      scripture: '1 John 1:5-7',
      date: new Date('2026-01-18'),
      thumbnailUrl:
        'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=640&h=360&fit=crop&q=80',
      duration: '38 min',
      description:
        "Understanding what it means to walk in God's light and be a light to others. Elder Prasert unpacks the practical implications of John's teaching about light and darkness.\n\nKey takeaways:\n- Walking in the light means living transparently before God\n- Fellowship with one another is a natural result of walking in light\n- The blood of Jesus continually cleanses us as we walk in the light\n- Being a light means letting Christ shine through our daily actions",
      views: 98,
      isPublished: true,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'The Sabbath Rest',
      titleThai: 'การหยุดพักวันสะบาโต',
      speaker: 'Pastor Somchai',
      speakerThai: 'ศจ. สมชาย',
      series: 'Foundations of Faith',
      scripture: 'Hebrews 4:9-11',
      date: new Date('2026-01-11'),
      thumbnailUrl:
        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=640&h=360&fit=crop&q=80',
      duration: '42 min',
      description:
        'Discovering the blessing and meaning of Sabbath rest in our busy modern lives. Pastor Somchai explores the Hebrew concept of rest and how the Sabbath is a gift from God for our physical, mental, and spiritual renewal.\n\nKey takeaways:\n- The Sabbath was made for humanity, not humanity for the Sabbath\n- True Sabbath rest involves ceasing from our own works and resting in God\n- The Sabbath points forward to the eternal rest we will experience in heaven\n- Keeping the Sabbath is an act of trust in God as our Provider',
      views: 87,
      isPublished: true,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Grace That Transforms',
      titleThai: 'พระคุณที่เปลี่ยนแปลง',
      speaker: 'Pastor Somchai',
      speakerThai: 'ศจ. สมชาย',
      series: 'Foundations of Faith',
      scripture: 'Ephesians 2:8-9',
      date: new Date('2026-01-04'),
      thumbnailUrl:
        'https://images.unsplash.com/photo-1445633883498-7f9922d37a3f?w=640&h=360&fit=crop&q=80',
      duration: '40 min',
      description:
        "Understanding God's transforming grace and how it changes our daily lives. In this message, we explore how grace is not just a one-time event at salvation, but a daily transforming power.\n\nKey takeaways:\n- Grace is unmerited favor — we cannot earn it\n- Grace doesn't just save us; it transforms us\n- Living in grace means extending grace to others\n- Grace empowers us to live differently",
      views: 76,
      isPublished: true,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'The Joy of Service',
      titleThai: 'ความชื่นชมยินดีในการรับใช้',
      speaker: 'Elder Prasert',
      speakerThai: 'ผู้ปกครอง ประเสริฐ',
      series: 'Living Like Jesus',
      scripture: 'Mark 10:45',
      date: new Date('2025-12-28'),
      thumbnailUrl:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=640&h=360&fit=crop&q=80',
      duration: '35 min',
      description:
        "Discovering joy in serving others as Jesus served us. Elder Prasert shares practical ways to serve in our community and explains why service brings such deep fulfillment.\n\nKey takeaways:\n- Jesus modeled servant leadership for us\n- True greatness in God's kingdom is measured by service\n- Service opportunities are all around us\n- Joy in service comes from losing ourselves for others",
      views: 65,
      isPublished: true,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Hope for Tomorrow',
      titleThai: 'ความหวังสำหรับวันพรุ่งนี้',
      speaker: 'Pastor Somchai',
      speakerThai: 'ศจ. สมชาย',
      series: 'Advent Hope',
      scripture: 'Titus 2:13',
      date: new Date('2025-12-21'),
      thumbnailUrl:
        'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=640&h=360&fit=crop&q=80',
      duration: '50 min',
      description:
        'The blessed hope of Christ\'s return and what it means for us today. This Advent-season message explores the promise of Jesus\' second coming and how this hope shapes our daily lives.\n\nKey takeaways:\n- The second coming is the "blessed hope" of every believer\n- This hope motivates holy living\n- We should live in readiness, not fear\n- The return of Christ will end all suffering and restore all things',
      views: 110,
      isPublished: true,
    },
  ];
  await Promise.all(sermonsData.map((s) => prisma.sermons.create({ data: s })));
  console.log(`✅ Created ${sermonsData.length} sermons`);

  // Seed Blog Posts (from frontend/src/data/blog.ts)
  console.log('📝 Creating blog posts...');
  const blogPostsData = [
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Youth Camp 2026 Registration Now Open!',
      titleThai: 'เปิดลงทะเบียนค่ายเยาวชน 2026 แล้ว!',
      slug: 'youth-camp-2026-registration-now-open',
      excerpt:
        'Join us for an unforgettable weekend of spiritual growth, fellowship, and adventure. Early bird registration is available until March 1st.',
      excerptThai:
        'ร่วมสุดสัปดาห์ที่ไม่มีวันลืมของการเติบโตฝ่ายจิตวิญญาณ สามัคคีธรรม และการผจญภัย ลงทะเบียนล่วงหน้าถึงวันที่ 1 มีนาคม',
      content: `Join us for an unforgettable weekend of spiritual growth, fellowship, and adventure at Youth Camp 2026! This year's theme is "Rooted in Faith" based on Colossians 2:6-7.\n\nEarly bird registration is available until March 1st with a special discounted rate. The camp will feature inspiring speakers, worship sessions, outdoor adventures, and team-building activities designed to strengthen your faith and build lasting friendships.\n\n**What to Expect:**\n- Dynamic worship sessions with live music\n- Inspiring messages from guest speakers\n- Outdoor adventures including hiking and team challenges\n- Small group Bible studies\n- Fellowship meals and bonfire nights\n- Creative workshops and talent show\n\n**Registration Details:**\n- Early Bird (before March 1): ฿500 per person\n- Regular (March 1-15): ฿700 per person\n- Family discount: 10% off for 3+ family members\n\nSpace is limited to 60 participants, so register early to secure your spot! Contact Brother Prasert or the Youth Ministry team for more information.`,
      contentThai: `ร่วมสุดสัปดาห์ที่ไม่มีวันลืมของการเติบโตฝ่ายจิตวิญญาณ สามัคคีธรรม และการผจญภัยที่ค่ายเยาวชน 2026! ธีมของปีนี้คือ "หยั่งรากในความเชื่อ" จากโคโลสี 2:6-7\n\nลงทะเบียนล่วงหน้าถึงวันที่ 1 มีนาคม พร้อมส่วนลดพิเศษ`,
      author: 'Youth Ministry',
      category: 'Announcement',
      categoryThai: 'ประกาศ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      readTime: 3,
      featured: true,
      isPublished: true,
      publishedAt: new Date('2026-01-28'),
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Testimony: How God Changed My Life',
      titleThai: 'คำพยาน: พระเจ้าเปลี่ยนแปลงชีวิตฉันอย่างไร',
      slug: 'testimony-how-god-changed-my-life',
      excerpt:
        'Sister Nok shares her powerful testimony of how she found Jesus and experienced transformation through His love and grace.',
      excerptThai:
        'ซิสเตอร์นกแบ่งปันคำพยานอันทรงพลังของเธอว่าเธอพบพระเยซูและประสบการเปลี่ยนแปลงผ่านความรักและพระคุณของพระองค์อย่างไร',
      content: `Sister Nok shares her powerful testimony of how she found Jesus and experienced transformation through His love and grace.\n\nGrowing up in a small village in northern Thailand, Nok never imagined her life would take such a dramatic turn. "I was searching for meaning," she recalls, "going through the motions of life without any real purpose."\n\nIt was through a friend's invitation to a Bible study group that everything changed. "The words of Scripture spoke directly to my heart," Nok says. "For the first time, I felt truly loved and accepted."\n\nAfter months of studying the Bible and attending church services, Nok made the decision to be baptized. "It was the best decision I've ever made," she says with tears of joy. "God has completely transformed my life — my relationships, my outlook, my purpose."\n\nToday, Nok is an active member of our church family, serving in the Women's Ministry and helping to organize community outreach programs.`,
      contentThai: 'ซิสเตอร์นกแบ่งปันคำพยานอันทรงพลังของเธอ',
      author: 'Sister Nok',
      category: 'Testimony',
      categoryThai: 'คำพยาน',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80',
      readTime: 5,
      featured: true,
      isPublished: true,
      publishedAt: new Date('2026-01-25'),
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Mission Report: Thailand Mission Field Update',
      titleThai: 'รายงานมิชชั่น: อัปเดตสนามมิชชั่นประเทศไทย',
      slug: 'mission-report-thailand-mission-field-update',
      excerpt:
        'Read about the progress of our mission work in northern Thailand and how your prayers and offerings are making a difference.',
      excerptThai: 'อ่านเกี่ยวกับความก้าวหน้าของงานมิชชั่นในภาคเหนือของประเทศไทย',
      content: `Read about the progress of our mission work in northern Thailand and how your prayers and offerings are making a difference.\n\nOur mission team recently returned from a two-week outreach program in Chiang Rai province.\n\n**Key Highlights:**\n- Over 200 community members received free health screenings\n- 15 Bible study groups were established in 3 villages\n- A new community garden project was launched\n- Educational materials were distributed to local schools\n- 8 individuals expressed interest in learning more about the Adventist faith`,
      contentThai: 'อ่านเกี่ยวกับความก้าวหน้าของงานมิชชั่นในภาคเหนือของประเทศไทย',
      author: 'Mission Department',
      category: 'Missions',
      categoryThai: 'มิชชั่น',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
      readTime: 7,
      featured: false,
      isPublished: true,
      publishedAt: new Date('2026-01-22'),
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Health Tips: Starting Your Plant-Based Journey',
      titleThai: 'เคล็ดลับสุขภาพ: เริ่มต้นการกินอาหารจากพืช',
      slug: 'health-tips-starting-your-plant-based-journey',
      excerpt:
        'Discover the benefits of a plant-based diet and get practical tips for transitioning to healthier eating habits.',
      excerptThai: 'ค้นพบประโยชน์ของอาหารจากพืชและรับเคล็ดลับปฏิบัติ',
      content: `Discover the benefits of a plant-based diet and get practical tips for transitioning to healthier eating habits.\n\nSeventh-day Adventists have long been advocates of a healthy lifestyle.\n\n**Benefits of Plant-Based Eating:**\n- Lower risk of heart disease and diabetes\n- Better weight management\n- Improved digestive health\n- More energy and better sleep`,
      contentThai: 'ค้นพบประโยชน์ของอาหารจากพืช',
      author: 'Health Ministry',
      category: 'Health',
      categoryThai: 'สุขภาพ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
      readTime: 6,
      featured: false,
      isPublished: true,
      publishedAt: new Date('2026-01-20'),
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Baptism Sabbath: Celebrating New Members',
      titleThai: 'สะบาโตบัพติศมา: ฉลองสมาชิกใหม่',
      slug: 'baptism-sabbath-celebrating-new-members',
      excerpt:
        'We rejoice with three new members who publicly declared their faith through baptism last Sabbath.',
      excerptThai: 'เราชื่นชมยินดีกับสมาชิกใหม่สามคน',
      content: `We rejoice with three new members who publicly declared their faith through baptism last Sabbath.\n\nThe three new members — Brother Somchai, Sister Ploy, and Brother Krit — each shared their personal testimony before their baptism, moving the congregation to tears of joy.`,
      contentThai: 'เราชื่นชมยินดีกับสมาชิกใหม่สามคน',
      author: 'Church Clerk',
      category: 'News',
      categoryThai: 'ข่าว',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
      readTime: 4,
      featured: false,
      isPublished: true,
      publishedAt: new Date('2026-01-18'),
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: "Sabbath School: This Week's Lesson Overview",
      titleThai: 'โรงเรียนสะบาโต: ภาพรวมบทเรียนสัปดาห์นี้',
      slug: 'sabbath-school-this-weeks-lesson-overview',
      excerpt:
        "A summary of this week's Adult Sabbath School lesson with discussion questions and key takeaways.",
      excerptThai: 'สรุปบทเรียนโรงเรียนสะบาโตผู้ใหญ่สัปดาห์นี้',
      content: `A summary of this week's Adult Sabbath School lesson with discussion questions and key takeaways.\n\n**This Week's Lesson: "The Promise of Rest"**\nMemory Text: "Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28`,
      contentThai: 'สรุปบทเรียนโรงเรียนสะบาโตผู้ใหญ่สัปดาห์นี้',
      author: 'Sabbath School',
      category: 'Education',
      categoryThai: 'การศึกษา',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80',
      readTime: 8,
      featured: false,
      isPublished: true,
      publishedAt: new Date('2026-01-15'),
    },
  ];
  await Promise.all(blogPostsData.map((b) => prisma.blog_posts.create({ data: b })));
  console.log(`✅ Created ${blogPostsData.length} blog posts`);

  // Seed Gallery Items (from frontend/src/data/gallery.ts)
  console.log('🖼️ Creating gallery items...');
  const galleryData = [
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Sabbath Morning Worship',
      titleThai: 'นมัสการเช้าวันสะบาโต',
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&q=80',
      albumId: 'sabbath-services',
      albumTitle: 'Sabbath Services',
      albumTitleThai: 'นมัสการวันสะบาโต',
      eventDate: '2026-01-25',
      photographer: 'Church Media Team',
      sortOrder: 1,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Pastor Preaching',
      titleThai: 'ศิษยาภิบาลเทศนา',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      albumId: 'sabbath-services',
      albumTitle: 'Sabbath Services',
      albumTitleThai: 'นมัสการวันสะบาโต',
      eventDate: '2026-01-25',
      sortOrder: 2,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Youth Group Meeting',
      titleThai: 'การประชุมกลุ่มเยาวชน',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
      albumId: 'youth-activities',
      albumTitle: 'Youth Activities',
      albumTitleThai: 'กิจกรรมเยาวชน',
      eventDate: '2025-12-20',
      sortOrder: 3,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Community Outreach',
      titleThai: 'การเข้าถึงชุมชน',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80',
      albumId: 'community-service',
      albumTitle: 'Community Service',
      albumTitleThai: 'บริการชุมชน',
      eventDate: '2025-11-15',
      sortOrder: 4,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Baptism Day',
      titleThai: 'วันบัพติศมา',
      imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
      albumId: 'baptism',
      albumTitle: 'Baptism Celebrations',
      albumTitleThai: 'พิธีบัพติศมา',
      eventDate: '2025-10-10',
      sortOrder: 5,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Special Sabbath Program',
      titleThai: 'โปรแกรมสะบาโตพิเศษ',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
      albumId: 'special-events',
      albumTitle: 'Special Events',
      albumTitleThai: 'กิจกรรมพิเศษ',
      eventDate: '2025-09-20',
      sortOrder: 6,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Fellowship Lunch',
      titleThai: 'อาหารกลางวันสามัคคีธรรม',
      imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&q=80',
      albumId: 'church-family',
      albumTitle: 'Church Family',
      albumTitleThai: 'ครอบครัวโบสถ์',
      eventDate: '2025-08-15',
      sortOrder: 7,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      title: 'Choir Performance',
      titleThai: 'การแสดงคณะนักร้องประสานเสียง',
      imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80',
      albumId: 'sabbath-services',
      albumTitle: 'Sabbath Services',
      albumTitleThai: 'นมัสการวันสะบาโต',
      eventDate: '2026-01-18',
      sortOrder: 8,
    },
  ];
  await Promise.all(galleryData.map((g) => prisma.gallery_items.create({ data: g })));
  console.log(`✅ Created ${galleryData.length} gallery items`);

  // Seed Prayer Requests (from frontend/src/pages/landing/PrayerPage.tsx)
  console.log('🙏 Creating prayer requests...');
  const prayerData = [
    {
      id: randomUUID(),
      updatedAt: new Date(),
      name: 'Anonymous',
      category: 'Health',
      categoryThai: 'สุขภาพ',
      request:
        "Please pray for my mother who is recovering from surgery. We trust in God's healing.",
      isPublic: true,
      isAnonymous: true,
      prayerCount: 15,
      status: 'APPROVED' as const,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      name: 'A Brother',
      category: 'Family',
      categoryThai: 'ครอบครัว',
      request:
        'Praying for unity and peace in my family. May God guide us through this difficult time.',
      isPublic: true,
      isAnonymous: true,
      prayerCount: 22,
      status: 'APPROVED' as const,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      name: 'Church Member',
      category: 'Guidance',
      categoryThai: 'การนำทาง',
      request: "Seeking God's direction for an important career decision. Please pray for wisdom.",
      isPublic: true,
      isAnonymous: true,
      prayerCount: 18,
      status: 'APPROVED' as const,
    },
    {
      id: randomUUID(),
      updatedAt: new Date(),
      name: 'A Sister',
      category: 'Thanksgiving',
      categoryThai: 'ขอบพระคุณ',
      request: 'Praising God for answered prayers! My son has accepted Jesus and been baptized.',
      isPublic: true,
      isAnonymous: true,
      prayerCount: 35,
      status: 'APPROVED' as const,
    },
  ];
  await Promise.all(prayerData.map((p) => prisma.prayer_requests.create({ data: p })));
  console.log(`✅ Created ${prayerData.length} prayer requests`);

  console.log('✅ Database seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@singburi-adventist.org / Admin123!');
  console.log('Staff: staff@singburi-adventist.org / Staff123!');
  console.log('Member: john.doe@example.com / Member123!');
  console.log('Member: jane.smith@example.com / Member123!');
  console.log('Member: peter.pan@example.com / Member123!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
