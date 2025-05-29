import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create a sample customer
    const customer = await prisma.customer.create({
      data: {
        name: 'John Doe',
        whatsappNumber: '+1234567890',
        email: 'john@example.com'
      }
    });

    // Create a sample order
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-001',
        customerName: customer.name,
        status: 'pending',
        total: 100.00,
        items: JSON.stringify([
          { name: 'Item 1', quantity: 2, price: 50.00 }
        ]),
        whatsappNumber: customer.whatsappNumber,
        customerId: customer.id
      }
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
