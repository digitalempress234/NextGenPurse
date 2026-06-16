import Redis from "ioredis";
import { config } from "./env.js";

const createRedisClient = () => {
  const RedisCtor = Redis as unknown as new (...args: any[]) => any;
  const client = new RedisCtor({
    host: config.redisHost,
    port: Number(config.redisPort),
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 10) return null; // stop retrying after 10 attempts
      return Math.min(times * 100, 3000);
    },
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  client.on("connect", () => {
    console.info("[Redis] Connected");
  });

  return client;
};

// Publisher client — used to publish messages
export const redisPublisher = createRedisClient();

// Subscriber client — dedicated connection for subscriptions (cannot be used for publishing)
export const redisSubscriber = createRedisClient();
