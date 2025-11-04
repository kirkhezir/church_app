import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const count = await prisma.member.count();
    console.log('✅ Database connection successful. Member count:', count);

    // Try to create a test member
    const testMember = await prisma.member.create({
      data: {
        email: 'dbtest@example.com',
        passwordHash: 'test-hash',
        firstName: 'DB',
        lastName: 'Test',
        role: 'MEMBER',
        phone: '+1234567890',
        membershipDate: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
        failedLoginAttempts: 0,
      },
    });
    console.log('✅ Test member created:', testMember.id);

    // Clean up
    await prisma.member.delete({ where: { id: testMember.id } });
    console.log('✅ Test member deleted successfully');
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
