const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase(prismaClient = prisma, { clean = true } = {}) {
  console.log('🌱 Starting database seed...');

  // Read Admin credentials from environment variables
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123!';

  // Clean existing records in reverse dependency order if requested
  if (clean) {
    await prismaClient.course.deleteMany();
    await prismaClient.user.deleteMany();
  }

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, salt);
  const standardPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. Create Initial Admin from Environment Variables
  const admin = await prismaClient.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Initial Admin created from ENV: ${admin.email} (${admin.name})`);

  // 2. Create Faculty
  const faculty1 = await prismaClient.user.create({
    data: {
      name: 'Dr. Sarah Smith',
      email: 'dr.smith@example.com',
      passwordHash: standardPasswordHash,
      role: 'FACULTY',
    },
  });
  console.log(`✅ Faculty 1 created: ${faculty1.email}`);

  const faculty2 = await prismaClient.user.create({
    data: {
      name: 'Prof. Michael Jones',
      email: 'prof.jones@example.com',
      passwordHash: standardPasswordHash,
      role: 'FACULTY',
    },
  });
  console.log(`✅ Faculty 2 created: ${faculty2.email}`);

  // 3. Create Students
  const student1 = await prismaClient.user.create({
    data: {
      name: 'Alice Williams',
      email: 'alice.student@example.com',
      passwordHash: standardPasswordHash,
      role: 'STUDENT',
    },
  });
  console.log(`✅ Student 1 created: ${student1.email}`);

  const student2 = await prismaClient.user.create({
    data: {
      name: 'Bob Davis',
      email: 'bob.student@example.com',
      passwordHash: standardPasswordHash,
      role: 'STUDENT',
    },
  });
  console.log(`✅ Student 2 created: ${student2.email}`);

  // 4. Create Demonstration Courses
  const courses = [
    {
      title: 'Introduction to Computer Science',
      courseCode: 'CS101',
      description: 'Comprehensive introduction to the fundamental concepts of computer programming, algorithmic problem solving, computational thinking, and modern software architectures.',
      duration: '12 Weeks (48 Hours)',
      facultyId: faculty1.id,
      createdById: admin.id, // Admin created, assigned to Faculty 1
    },
    {
      title: 'Data Structures and Algorithms',
      courseCode: 'CS201',
      description: 'Rigorous analysis of fundamental data structures including trees, graphs, heaps, hash tables, asymptotic time complexity analysis, and advanced algorithm design techniques.',
      duration: '14 Weeks (56 Hours)',
      facultyId: faculty1.id,
      createdById: faculty1.id, // Faculty 1 created & self-assigned
    },
    {
      title: 'Database Systems & Engineering',
      courseCode: 'CS301',
      description: 'Foundations of relational database management systems, SQL mastery, normalization, transactional concurrency control, B-Tree indexing, and query execution optimization.',
      duration: '10 Weeks (40 Hours)',
      facultyId: faculty2.id,
      createdById: admin.id, // Admin created, assigned to Faculty 2
    },
    {
      title: 'Cloud Architecture & Distributed Systems',
      courseCode: 'CS401',
      description: 'Patterns for designing scalable, resilient distributed cloud applications. Covers microservices architecture, Docker containerization, REST/gRPC protocols, and message queues.',
      duration: '12 Weeks (48 Hours)',
      facultyId: faculty2.id,
      createdById: faculty2.id, // Faculty 2 created & self-assigned
    },
    {
      title: 'Applied Machine Learning & AI Foundations',
      courseCode: 'CS501',
      description: 'Mathematical principles of machine learning, regression, classification, clustering, deep neural network architectures, backpropagation, and end-to-end model evaluation.',
      duration: '16 Weeks (64 Hours)',
      facultyId: faculty1.id,
      createdById: admin.id, // Admin created, assigned to Faculty 1
    },
    {
      title: 'Cybersecurity & Cryptographic Protocols',
      courseCode: 'CS601',
      description: 'In-depth exploration of asymmetric/symmetric cryptography, secure communication protocols, identity and access management, vulnerability assessments, and threat mitigation.',
      duration: '10 Weeks (40 Hours)',
      facultyId: faculty2.id,
      createdById: faculty2.id, // Faculty 2 created & self-assigned
    },
  ];

  for (const courseData of courses) {
    const course = await prismaClient.course.create({ data: courseData });
    console.log(`📚 Course created: [${course.courseCode}] ${course.title}`);
  }

  console.log('✨ Database seeding completed successfully!');
}

async function main() {
  await seedDatabase(prisma, { clean: true });
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedDatabase };
