import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/billing-app',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};

// Validate required env vars in production
if (config.nodeEnv === 'production') {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
