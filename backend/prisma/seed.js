const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Production-Safe Initial Administrator Provisioning Script
 * Reads ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD from environment variables.
 * Creates the initial Admin user if one does not already exist without wiping or altering existing data.
 */
async function seedDatabase(prismaClient = prisma) {
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : null;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('ℹ️  No ADMIN_EMAIL or ADMIN_PASSWORD set in environment. Skipping initial admin provisioning.');
    return;
  }

  // Check if an account with this email already exists
  const existingAdmin = await prismaClient.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`ℹ️  Admin user [${existingAdmin.email}] already exists (Role: ${existingAdmin.role}).`);
    return;
  }

  // Hash the admin password securely
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const newAdmin = await prismaClient.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  console.log(`✅ Initial Administrator provisioned successfully: ${newAdmin.email} (${newAdmin.name})`);
}

async function main() {
  console.log('🚀 Running database initialization...');
  await seedDatabase(prisma);
  console.log('✨ Initialization completed.');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Database initialization error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedDatabase };
