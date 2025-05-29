import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEmpty() {
  try {
    const orderCount = await prisma.order.count();
    const customerCount = await prisma.customer.count();
    const auditLogCount = await prisma.auditLog.count();
    const messageLogCount = await prisma.messageLog.count();

    console.log('Database Record Counts:');
    console.log('---------------------');
    console.log(`Orders: ${orderCount}`);
    console.log(`Customers: ${customerCount}`);
    console.log(`Audit Logs: ${auditLogCount}`);
    console.log(`Message Logs: ${messageLogCount}`);

    if (orderCount + customerCount + auditLogCount + messageLogCount === 0) {
      console.log('\n✓ Database is empty');
    } else {
      console.log('\n⚠ Database still contains some records');
    }
  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmpty();
