import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/infrastructure/auth/passwordService';

const prisma = new PrismaClient();
const passwordService = new PasswordService();

async function seedTestMembers() {
  console.log('🌱 Seeding test members...');

  // Clean up existing test members
  await prisma.member.deleteMany({
    where: {
      email: {
        in: ['event-admin@example.com', 'event-member@example.com'],
      },
    },
  });

  // Create admin member
  const adminPassword = await passwordService.hash('AdminPass123!');
  const admin = await prisma.member.create({
    data: {
      email: 'event-admin@example.com',
      passwordHash: adminPassword,
      firstName: 'Event',
      lastName: 'Admin',
      role: 'ADMIN',
      phone: '+1234567890',
      membershipDate: new Date(),
      privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      failedLoginAttempts: 0,
    },
  });

  // Create regular member
  const memberPassword = await passwordService.hash('MemberPass123!');
  const member = await prisma.member.create({
    data: {
      email: 'event-member@example.com',
      passwordHash: memberPassword,
      firstName: 'Event',
      lastName: 'Member',
      role: 'MEMBER',
      phone: '+1234567891',
      membershipDate: new Date(),
      privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      failedLoginAttempts: 0,
    },
  });

  console.log('✅ Test members created:');
  console.log('   Admin:', admin.id, admin.email);
  console.log('   Member:', member.id, member.email);

  await prisma.$disconnect();
}

seedTestMembers().catch((error) => {
  console.error('❌ Error seeding test members:', error);
  process.exit(1);
});
