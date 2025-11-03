import { PrismaClient, Role, EventCategory, Priority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🗑️  Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.memberAnnouncementView.deleteMany();
    await prisma.message.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.eventRSVP.deleteMany();
    await prisma.event.deleteMany();
    await prisma.member.deleteMany();
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.member.create({
    data: {
      email: 'admin@singburi-adventist.org',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+66812345678',
      address: '123 Church Street, Sing Buri, Thailand',
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
  const staff = await prisma.member.create({
    data: {
      email: 'staff@singburi-adventist.org',
      passwordHash: staffPasswordHash,
      firstName: 'Staff',
      lastName: 'Member',
      phone: '+66823456789',
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
    prisma.member.create({
      data: {
        email: 'john.doe@example.com',
        passwordHash: memberPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+66834567890',
        address: '456 Main Road, Sing Buri, Thailand',
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
    prisma.member.create({
      data: {
        email: 'jane.smith@example.com',
        passwordHash: memberPasswordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+66845678901',
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
    prisma.member.create({
      data: {
        email: 'peter.pan@example.com',
        passwordHash: memberPasswordHash,
        firstName: 'Peter',
        lastName: 'Pan',
        phone: '+66856789012',
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

  // Create events
  console.log('📅 Creating events...');
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    prisma.event.create({
      data: {
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
    prisma.event.create({
      data: {
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
    prisma.event.create({
      data: {
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
  console.log(`✅ Created ${events.length} events`);

  // Create RSVPs
  console.log('✅ Creating RSVPs...');
  await Promise.all([
    prisma.eventRSVP.create({
      data: {
        eventId: events[0].id,
        memberId: members[0].id,
      },
    }),
    prisma.eventRSVP.create({
      data: {
        eventId: events[0].id,
        memberId: members[1].id,
      },
    }),
    prisma.eventRSVP.create({
      data: {
        eventId: events[1].id,
        memberId: members[2].id,
      },
    }),
  ]);
  console.log('✅ Created RSVPs');

  // Create announcements
  console.log('📢 Creating announcements...');
  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
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
    prisma.announcement.create({
      data: {
        title: 'Upcoming Community Outreach Event',
        content: `Join us next month for our community outreach day! We'll be serving our local community with food distribution and clothing donations. 

Volunteers are needed! Please RSVP to the event if you can help.`,
        priority: Priority.NORMAL,
        authorId: staff.id,
      },
    }),
  ]);
  console.log(`✅ Created ${announcements.length} announcements`);

  // Create a sample message
  console.log('💬 Creating sample message...');
  await prisma.message.create({
    data: {
      senderId: members[0].id,
      recipientId: members[1].id,
      subject: 'Welcome to the church!',
      body: 'Hi Jane! Welcome to our church family. Looking forward to getting to know you better!',
    },
  });
  console.log('✅ Created sample message');

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
