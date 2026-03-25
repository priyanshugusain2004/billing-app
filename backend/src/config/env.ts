import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;
const insecureJwtSecrets = new Set([
  'your_secret_key',
  'your_super_secret_key',
  'PASTE_A_LONG_RANDOM_SECRET_HERE',
]);

const isJwtSecretMissingOrInsecure =
  !jwtSecret || insecureJwtSecrets.has(jwtSecret);

if (isJwtSecretMissingOrInsecure && nodeEnv === 'production') {
  throw new Error(
    'JWT_SECRET must be set to a strong secret in production environments.'
  );
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/billing-app',
  },
  jwt: {
    secret: isJwtSecretMissingOrInsecure
      ? 'dev_insecure_secret_change_me'
      : jwtSecret,
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  subscription: {
    onboardingFeeInr: Number(process.env.SUBSCRIPTION_ONBOARDING_FEE_INR || 500),
    validityDays: Number(process.env.SUBSCRIPTION_VALIDITY_DAYS || 30),
  },
  analytics: {
    adminKey: process.env.PLATFORM_ADMIN_KEY || '',
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
