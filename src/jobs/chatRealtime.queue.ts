import { Queue, Worker } from "bullmq";
import { config } from "../config/env.js";

const QUEUE_NAME = "chat-realtime-events";

const isProduction = config.nodeEnv === "production";

const connection = {
  host: config.redisHost,
  port: Number(config.redisPort),
  ...(isProduction
    ? {}
    : {
        retryStrategy: () => null,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      }),
};

let queueInstance;

const getQueue = () => {
  if (!queueInstance) {
    queueInstance = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 500,
        removeOnFail: 1000,
      },
    });
  }
  return queueInstance;
};

export const chatRealtimeQueue = {
  add: async (...args) => {
    const queue = getQueue();
    return queue.add(...args);
  },
};

let workerStarted = false;

export const startChatRealtimeWorker = (handler) => {
  if (workerStarted) return;

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      await handler(job.data);
    },
    { connection }
  );

  worker.on("failed", (job, err) => {
    console.error(`[BullMQ] Chat realtime job failed (${job?.id}):`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[BullMQ] Chat realtime worker error:", err.message);
  });

  workerStarted = true;
};
