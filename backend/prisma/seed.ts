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
