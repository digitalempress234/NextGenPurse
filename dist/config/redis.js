import ioredis from "ioredis";
const { Redis } = ioredis;
import { config } from "./env.js";
const createRedisClient = () => {
    const redisOptions = {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword || undefined,
        db: config.redisDb,
        // Required for BullMQ
        maxRetriesPerRequest: null,
        // Recommended
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: (times) => {
            if (times > 10)
                return null;
            return Math.min(times * 100, 3000);
        },
    };
    if (config.redisTls) {
        redisOptions.tls = {};
    }
    const client = new Redis(redisOptions);
    client.on("error", (err) => {
        console.error("[Redis] Connection error:", err.message);
    });
    client.on("connect", () => {
        console.info("[Redis] Connected");
    });
    client.on("ready", () => {
        console.info("[Redis] Ready");
    });
    client.on("close", () => {
        console.warn("[Redis] Connection closed");
    });
    return client;
};
export const redisPublisher = createRedisClient();
export const redisSubscriber = createRedisClient();
export const createBullMQRedisConnection = () => {
    return createRedisClient();
};
export default {
    redisPublisher,
    redisSubscriber,
    createBullMQRedisConnection,
};
//# sourceMappingURL=redis.js.map