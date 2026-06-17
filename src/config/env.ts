import { randomBytes } from "crypto";

type NodeEnv = "development" | "test" | "production";

<<<<<<< HEAD:src/config/env.js
=======
interface AppConfig {
  port: number;
  nodeEnv: NodeEnv;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  clientUrl: string;
  emailUser?: string;
  emailPass?: string;
  emailHost: string;
  emailPort: number;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  paystackSecretKey?: string;
  paystackPublicKey?: string;
  paystackWebhookSecret?: string;
  baseUrl?: string;
  redisHost: string;
  redisPort: number;
}

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"] as const;

>>>>>>> updated-project:src/config/env.ts
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`,
  );
}
<<<<<<< HEAD:src/config/env.js
const getJwtSecret = () => {
=======

const getJwtSecret = (): string => {
>>>>>>> updated-project:src/config/env.ts
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

<<<<<<< HEAD:src/config/env.js
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return secret;
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

export const config = {
  // Server
  port: toNumber(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV || "development",
=======
  return secret;
};

const parsedNodeEnv = (process.env.NODE_ENV || "development") as NodeEnv;
>>>>>>> updated-project:src/config/env.ts

export const config: AppConfig = {
  port: Number.parseInt(process.env.PORT || "5000", 10),
  nodeEnv: parsedNodeEnv,

  databaseUrl: process.env.DATABASE_URL!,

  jwtSecret: getJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

<<<<<<< HEAD:src/config/env.js
  // CORS
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  // Base URL
  baseUrl:
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,

  // Redis
  redisHost: process.env.REDIS_HOST || "127.0.0.1",
  redisPort: toNumber(process.env.REDIS_PORT, 6379),
  redisPassword: process.env.REDIS_PASSWORD || "",
  redisDb: toNumber(process.env.REDIS_DB, 0),
  redisTls: toBoolean(process.env.REDIS_TLS, false),
=======
  clientUrl: process.env.CLIENT_URL!,
>>>>>>> updated-project:src/config/env.ts

  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
<<<<<<< HEAD:src/config/env.js
  emailHost: process.env.EMAIL_HOST || "smtp.titan.email",
  emailPort: toNumber(process.env.EMAIL_PORT, 465),
  emailSecure: toBoolean(
    process.env.EMAIL_SECURE,
    toNumber(process.env.EMAIL_PORT, 465) === 465,
  ),
=======
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: Number.parseInt(process.env.EMAIL_PORT || "587", 10),
>>>>>>> updated-project:src/config/env.ts

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
<<<<<<< HEAD:src/config/env.js
};

export default config;
=======

  baseUrl: process.env.BASE_URL,

  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
};

if (config.nodeEnv === "development") {
  console.log("Running in development mode");
} else if (config.nodeEnv === "production") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and be at least 32 characters in production");
  }
}
>>>>>>> updated-project:src/config/env.ts
