import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDb() {
  try {
    // Delete all records from all tables in the correct order to handle foreign key constraints
    console.log('Cleaning database...');
    
    // Delete all orders first (they reference customers)
    await prisma.order.deleteMany();
    console.log('✓ Cleared orders table');
    
    // Delete audit logs
    await prisma.auditLog.deleteMany();
    console.log('✓ Cleared audit logs table');
    
    // Delete message logs
    await prisma.messageLog.deleteMany();
    console.log('✓ Cleared message logs table');
    
    // Delete customers last (since they are referenced by other tables)
    await prisma.customer.deleteMany();
    console.log('✓ Cleared customers table');

    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDb();
