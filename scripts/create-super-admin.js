const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Changed from bcryptjs to bcrypt
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createSuperAdmin() {
  try {
    console.log('Creating Super Admin User');
    console.log('------------------------');

    // Get user input
    const email = await question('Enter email: ');
    const name = await question('Enter name: ');
    const password = await question('Enter password: ');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`\nUser with email ${email} already exists.`);
      
      // Update to super admin if needed
      if (existingUser.role !== 'SUPER_ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'SUPER_ADMIN' }
        });
        console.log(`Updated user role to SUPER_ADMIN.`);
      } else {
        console.log(`User is already a SUPER_ADMIN.`);
      }
    } else {
      // Hash password using bcrypt with salt rounds of 10
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new super admin
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });

      console.log(`\nSuper Admin created successfully!`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    }
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

createSuperAdmin();