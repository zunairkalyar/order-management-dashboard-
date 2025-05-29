import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
  database: {
    url: process.env.DATABASE_URL
  },
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL,
    apiToken: process.env.WHATSAPP_API_TOKEN
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
};

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
};

export function validateConfig() {
  const requiredEnvVars = ['JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} is not set, using default value`);
    }
  }
}
