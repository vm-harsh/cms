const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/db');
const { seedDatabase } = require('../prisma/seed');

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected via Prisma');

    // Auto-seed if database is empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Seeding initial data...');
      await seedDatabase(prisma, { clean: false });
    }

    const server = app.listen(config.port, () => {
      console.log(`🚀 Course Management System API running at http://localhost:${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔒 Client URL: ${config.clientUrl}`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('💤 HTTP server closed.');
        await prisma.$disconnect();
        console.log('🔌 Database connection disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
