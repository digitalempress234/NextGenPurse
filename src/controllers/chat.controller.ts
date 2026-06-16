import * as chatService from "../services/chat.service.js";

export const listAdminChatUsers = async (req, res, next) => {
  try {
    const result = await chatService.listChatUsers(req.user, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const listConversations = async (req, res, next) => {
  try {
    const result = await chatService.listConversations(req.user, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req, res, next) => {
  try {
    const conversation = await chatService.startConversation(req.user, req.body.participantId);
    res.status(201).json({ message: "Conversation ready", conversation });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const result = await chatService.getMessages(req.user, req.params.conversationId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.user, req.params.conversationId, req.body.body);
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    next(error);
  }
};

export const streamConversation = async (req, res, next) => {
  try {
    res.status(410).json({
      message: "SSE stream endpoint is deprecated. Use Socket.IO for realtime chat.",
    });
  } catch (error) {
    next(error);
  }
};

export const markConversationRead = async (req, res, next) => {
  try {
    const result = await chatService.markConversationRead(req.user, req.params.conversationId);
    res.json({ message: "Conversation marked as read", ...result });
  } catch (error) {
    next(error);
  }
};
