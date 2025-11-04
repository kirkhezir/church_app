import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:admin123@localhost:5432/church_app',
    },
  },
});

async function checkMembers() {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('📊 Total members in database:', members.length);
    console.log('Members:', JSON.stringify(members, null, 2));

    const adminMember = await prisma.member.findFirst({
      where: { email: 'event-admin@example.com' },
    });
    console.log('\n🔍 Admin member:', adminMember ? 'EXISTS' : 'NOT FOUND');
    if (adminMember) {
      console.log('  ID:', adminMember.id);
      console.log('  Email:', adminMember.email);
      console.log('  Role:', adminMember.role);
    }

    const regularMember = await prisma.member.findFirst({
      where: { email: 'event-member@example.com' },
    });
    console.log('\n🔍 Regular member:', regularMember ? 'EXISTS' : 'NOT FOUND');
    if (regularMember) {
      console.log('  ID:', regularMember.id);
      console.log('  Email:', regularMember.email);
      console.log('  Role:', regularMember.role);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMembers();
