import { randomBytes } from "crypto";

// Validate required environment variables
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLIENT_URL",
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

// Generate a strong JWT secret if not provided or too weak
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.warn(" WARNING: JWT_SECRET is missing or too weak. Generating a strong random secret.");
    console.warn(" Please set JWT_SECRET in your .env file for production (min 64 characters).");
    const generated = randomBytes(64).toString("hex");
    console.log(` Generated JWT Secret: ${generated}`);
    return generated;
  }
  return secret;
};

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongoUri: process.env.MONGO_URI,
  mongoUriTest: process.env.MONGO_URI_TEST,

  // JWT
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // CORS
  clientUrl: process.env.CLIENT_URL,

  // Email
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: process.env.EMAIL_PORT || 587,

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  // Paystack
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,

  // Base URL
  baseUrl: process.env.BASE_URL,

  // Redis
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: process.env.REDIS_PORT || 6379,
};

// Log configuration warnings in development
if (config.nodeEnv === "development") {
  console.log("Running in development mode");
} else if (config.nodeEnv === "production") {
  // In production, ensure JWT secret is strong
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and be at least 32 characters in production");
  }
}