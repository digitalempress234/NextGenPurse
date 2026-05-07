import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { io as Client } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

let mockQueuedJobHandler;

jest.mock("../../src/jobs/chatRealtime.queue.js", () => ({
  __esModule: true,
  chatRealtimeQueue: {
    add: jest.fn(async (_name, payload) => {
      if (mockQueuedJobHandler) {
        await mockQueuedJobHandler(payload);
      }
      return { id: "mock-job-id" };
    }),
  },
  startChatRealtimeWorker: jest.fn((handler) => {
    mockQueuedJobHandler = handler;
  }),
}));

var mockPrisma;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    chatConversation: {
      findFirst: jest.fn(),
    },
  }),
}));

jest.mock("../../src/config/env.js", () => ({
  __esModule: true,
  config: {
    nodeEnv: "test",
    clientUrl: "http://localhost:3000",
    jwtSecret: "test-jwt-secret",
  },
}));

import { initializeChatSocket, getChatSocket } from "../../src/services/chatSocket.service.js";
import { publishConversationMessage, publishConversationRead } from "../../src/services/chatRealtime.service.js";

const waitForEvent = (socket, eventName, timeoutMs = 3000) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for event: ${eventName}`));
    }, timeoutMs);

    socket.once(eventName, (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });

describe("Socket chat flow", () => {
  let server;
  let client;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQueuedJobHandler = undefined;

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      role: "admin",
      isActive: true,
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "User",
    });

    mockPrisma.chatConversation.findFirst.mockResolvedValue({ id: 9 });

    const app = express();
    server = http.createServer(app);

    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    await initializeChatSocket(server);

    const { port } = server.address();
    const token = jwt.sign({ id: 1 }, "test-jwt-secret", { expiresIn: "1h" });

    client = new Client(`http://127.0.0.1:${port}`, {
      transports: ["websocket"],
      auth: { token },
    });

    await waitForEvent(client, "connect");
  });

  afterEach(async () => {
    if (client?.connected) {
      client.disconnect();
    }

    const io = getChatSocket();
    if (io) {
      await new Promise((resolve) => io.close(resolve));
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("emits joined, message and read events for a conversation room", async () => {
    const joinedPromise = waitForEvent(client, "chat:joined");

    client.emit("chat:join", { conversationId: 9 });

    const joined = await joinedPromise;
    expect(joined).toEqual({ conversationId: "9" });

    const messagePromise = waitForEvent(client, "chat:message");
    await publishConversationMessage(9, { id: "msg-1", body: "hello" });

    const message = await messagePromise;
    expect(message.conversationId).toBe("9");
    expect(message.message).toEqual({ id: "msg-1", body: "hello" });

    const readPromise = waitForEvent(client, "chat:read");
    await publishConversationRead(9, { markedRead: 1 });

    const read = await readPromise;
    expect(read.conversationId).toBe("9");
    expect(read.markedRead).toBe(1);
  });
});
