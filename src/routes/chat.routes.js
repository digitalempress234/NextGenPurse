import express from 'express';
import {
  listAdminChatUsers,
  listConversations,
  startConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  streamConversation,
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  listAdminChatUsersValidation,
  listConversationsValidation,
  startConversationValidation,
  getMessagesValidation,
  sendMessageValidation,
  markConversationReadValidation,
} from '../middleware/validation.middleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/chat/users:
 *   get:
 *     summary: List all chat users for admin
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, vendor, rider]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of eligible chat users
 */
router.get(
  '/users',
  listAdminChatUsersValidation,
  listAdminChatUsers
);

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: List admin conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, vendor, rider]
 *         description: Filter by participant role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of conversations with pagination
 */
router.get(
  '/conversations',
  listConversationsValidation,
  listConversations
);

/**
 * @swagger
 * /api/chat/conversations:
 *   post:
 *     summary: Start or get existing conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: integer
 *                 description: ID of the user to chat with
 *     responses:
 *       201:
 *         description: Conversation created or retrieved
 *       400:
 *         description: Validation error
 */
router.post(
  '/conversations',
  startConversationValidation,
  startConversation
);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages from a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Messages from conversation with pagination
 *       404:
 *         description: Conversation not found
 */
router.get(
  '/conversations/:conversationId/messages',
  getMessagesValidation,
  getMessages
);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Conversation not found
 */
router.post(
  '/conversations/:conversationId/messages',
  sendMessageValidation,
  sendMessage
);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/read:
 *   patch:
 *     summary: Mark conversation as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation marked as read
 *       404:
 *         description: Conversation not found
 */
router.patch(
  '/conversations/:conversationId/read',
  markConversationReadValidation,
  markConversationRead
);

router.get(
  '/conversations/:conversationId/stream',
  markConversationReadValidation,
  streamConversation
);

export default router;
