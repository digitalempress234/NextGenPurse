import { jest, describe, it, expect, beforeEach } from "@jest/globals";

var mockPublishConversationMessage;
var mockPublishConversationRead;

jest.mock("../../src/services/chatRealtime.service.js", () => ({
  __esModule: true,
  addConversationStream: jest.fn(),
  removeConversationStream: jest.fn(),
  publishConversationMessage: (mockPublishConversationMessage = jest.fn().mockResolvedValue(undefined)),
  publishConversationRead: (mockPublishConversationRead = jest.fn().mockResolvedValue(undefined)),
}));

var mockPrisma;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    chatConversation: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    chatMessage: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  }),
}));

import * as chatService from "../../src/services/chat.service.js";

describe("Chat Service", () => {
  const admin = { id: 1, role: "admin" };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockPrisma));
  });

  it("lists chat-eligible customers, vendors, and riders", async () => {
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findMany.mockResolvedValue([{ id: 2, role: "customer", email: "customer@test.com" }]);

    const result = await chatService.listChatUsers(admin, { role: "customer", page: 1, limit: 10 });

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { role: "customer", isActive: true },
      skip: 0,
      take: 10,
    }));
    expect(result.items[0]._id).toBe("2");
  });

  it("starts or reuses an admin conversation with a participant", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 2, role: "vendor", isActive: true });
    mockPrisma.chatConversation.upsert.mockResolvedValue({
      id: 9,
      adminId: 1,
      participantId: 2,
    });

    const result = await chatService.startConversation(admin, 2);

    expect(mockPrisma.chatConversation.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { adminId_participantId: { adminId: 1, participantId: 2 } },
      create: { adminId: 1, participantId: 2 },
    }));
    expect(result._id).toBe("9");
  });

  it("rejects conversations with admins", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 2, role: "admin", isActive: true });

    await expect(chatService.startConversation(admin, 2)).rejects.toThrow("Chat participant not found");
  });

  it("sends a message and updates the conversation timestamp", async () => {
    const createdAt = new Date();
    mockPrisma.chatConversation.findFirst.mockResolvedValue({ id: 9, adminId: 1, participantId: 2 });
    mockPrisma.chatMessage.create.mockResolvedValue({
      id: 12,
      conversationId: 9,
      senderId: 1,
      body: "Hello",
      createdAt,
    });
    mockPrisma.chatConversation.update.mockResolvedValue({});

    const result = await chatService.sendMessage(admin, 9, " Hello ");

    expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith(expect.objectContaining({
      data: { conversationId: 9, senderId: 1, body: "Hello" },
    }));
    expect(mockPrisma.chatConversation.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { lastMessageAt: createdAt },
    });
    expect(mockPublishConversationMessage).toHaveBeenCalledTimes(1);
    expect(result.body).toBe("Hello");
  });

  it("marks participant messages as read", async () => {
    mockPrisma.chatConversation.findFirst.mockResolvedValue({ id: 9, adminId: 1, participantId: 2 });
    mockPrisma.chatMessage.updateMany.mockResolvedValue({ count: 3 });

    const result = await chatService.markConversationRead(admin, 9);

    expect(mockPrisma.chatMessage.updateMany).toHaveBeenCalledWith({
      where: { conversationId: 9, senderId: { not: 1 }, readAt: null },
      data: { readAt: expect.any(Date) },
    });
    expect(mockPublishConversationRead).toHaveBeenCalledTimes(1);
    expect(result.markedRead).toBe(3);
  });
});
