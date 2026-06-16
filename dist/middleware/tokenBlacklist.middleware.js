import { config } from "../config/env.js";
import { redisPublisher } from "../config/redis.js";
const TOKEN_PREFIX = "auth:blacklist:";
const testBlacklistFallback = new Set();
const tokenKey = (token) => `${TOKEN_PREFIX}${token}`;
const isTestEnv = () => config.nodeEnv === "test";
const ensureRedisConnection = async () => {
    if (redisPublisher.status === "wait") {
        await redisPublisher.connect();
    }
};
const computeTtlMs = (expiresAt) => {
    const ttl = Number(expiresAt) - Date.now();
    return Number.isFinite(ttl) && ttl > 0 ? ttl : 0;
};
// Add token to blacklist
export const blacklistToken = async (token, expiresAt) => {
    if (isTestEnv()) {
        testBlacklistFallback.add(token);
        return;
    }
    const ttlMs = computeTtlMs(expiresAt);
    if (ttlMs <= 0)
        return;
    await ensureRedisConnection();
    await redisPublisher.set(tokenKey(token), "1", "PX", ttlMs);
};
// Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
    if (isTestEnv()) {
        return testBlacklistFallback.has(token);
    }
    await ensureRedisConnection();
    const exists = await redisPublisher.get(tokenKey(token));
    return exists === "1";
};
// Middleware to check if token is blacklisted
export const checkTokenBlacklist = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }
        const token = authHeader.substring(7);
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return res.status(401).json({
                message: "Token has been invalidated. Please login again.",
            });
        }
        return next();
    }
    catch (error) {
        // Fail-open to preserve API availability if Redis is temporarily unreachable.
        console.error("[TokenBlacklist] Redis check failed:", error.message);
        return next();
    }
};
export default { blacklistToken, isTokenBlacklisted, checkTokenBlacklist };
//# sourceMappingURL=tokenBlacklist.middleware.js.map