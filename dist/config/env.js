const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is required");
    }
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
    if (value === undefined || value === null || value === "")
        return fallback;
    return String(value).toLowerCase() === "true";
};
export const config = {
    // Server
    port: toNumber(process.env.PORT, 5000),
    nodeEnv: (process.env.NODE_ENV || "development"),
    // Database
    databaseUrl: process.env.DATABASE_URL,
    // JWT
    jwtSecret: getJwtSecret(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    // CORS
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    // Base URL
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
    // Redis
    redisHost: process.env.REDIS_HOST || "127.0.0.1",
    redisPort: toNumber(process.env.REDIS_PORT, 6379),
    redisPassword: process.env.REDIS_PASSWORD || "",
    redisDb: toNumber(process.env.REDIS_DB, 0),
    redisTls: toBoolean(process.env.REDIS_TLS, false),
    // Email
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    emailHost: process.env.EMAIL_HOST || "smtp.titan.email",
    emailPort: toNumber(process.env.EMAIL_PORT, 465),
    emailSecure: toBoolean(process.env.EMAIL_SECURE, toNumber(process.env.EMAIL_PORT, 465) === 465),
    // Cloudinary
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    // Paystack
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
    paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
    // Admin
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
};
export default config;
//# sourceMappingURL=env.js.map