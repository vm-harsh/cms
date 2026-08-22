const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_development_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'cms_token',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

module.exports = config;
