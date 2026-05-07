import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

var mockGetMessages;
var mockSendMessage;
var mockMarkConversationRead;
var mockStreamConversation;

jest.mock("../../src/middleware/auth.middleware.js", () => ({
  __esModule: true,
  protect: (req, res, next) => next(),
  admin: (req, res, next) => next(),
  authorize: () => (req, res, next) => next(),
}));

jest.mock("../../src/controllers/chat.controller.js", () => ({
  __esModule: true,
  listAdminChatUsers: jest.fn((req, res) => res.status(200).json({ ok: true })),
  listConversations: jest.fn((req, res) => res.status(200).json({ ok: true })),
  startConversation: jest.fn((req, res) => res.status(201).json({ ok: true })),
  getMessages: (mockGetMessages = jest.fn((req, res) => res.status(200).json({ ok: true }))),
  sendMessage: (mockSendMessage = jest.fn((req, res) => res.status(201).json({ ok: true }))),
  markConversationRead: (mockMarkConversationRead = jest.fn((req, res) => res.status(200).json({ ok: true }))),
  streamConversation: (mockStreamConversation = jest.fn((req, res) => res.status(200).json({ ok: true }))),
}));

import chatRoutes from "../../src/routes/chat.routes.js";

describe("Admin chat routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(chatRoutes);
  });

  it("rejects invalid conversation ids before getMessages runs", async () => {
    const response = await request(app).get("/conversations/not-a-number/messages");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: "Validation failed",
      errors: [
        {
          field: "conversationId",
          message: "Conversation ID must be a valid integer",
        },
      ],
    });
    expect(mockGetMessages).not.toHaveBeenCalled();
  });

  it("rejects empty message bodies before sendMessage runs", async () => {
    const response = await request(app)
      .post("/conversations/12/messages")
      .send({ body: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "error",
      message: "Validation failed",
      errors: [
        {
          field: "body",
          message: "Message body is required",
        },
      ],
    });
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it("allows valid read requests through to the controller", async () => {
    const response = await request(app).patch("/conversations/12/read");

    expect(response.status).toBe(200);
    expect(mockMarkConversationRead).toHaveBeenCalledTimes(1);
  });
});