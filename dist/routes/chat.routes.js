import express from 'express';
import { listAdminChatUsers, listConversations, startConversation, getMessages, sendMessage, markConversationRead, } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { listAdminChatUsersValidation, listConversationsValidation, startConversationValidation, getMessagesValidation, sendMessageValidation, markConversationReadValidation, } from '../middleware/validation.middleware.js';
const router = express.Router();
// All chat routes require authentication
router.use(protect);
/**
 * @swagger
 * /api/chat/users:
 *   get:
 *     summary: List all users available to chat with
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [customer, vendor, rider] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Users fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Users fetched successfully" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/ChatUser' } }
 */
router.get('/users', listAdminChatUsersValidation, listAdminChatUsers);
/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: List conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [customer, vendor, rider] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Conversations fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Conversations fetched successfully" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/ChatConversation' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *   post:
 *     summary: Start a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId]
 *             properties:
 *               participantId: { type: integer }
 *     responses:
 *       201:
 *         description: Conversation started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Conversation started" }
 *                 data: { $ref: '#/components/schemas/ChatConversation' }
 */
router.get('/conversations', listConversationsValidation, listConversations);
router.post('/conversations', startConversationValidation, startConversation);
/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Messages fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Messages fetched successfully" }
 *                 data: { type: array, items: { $ref: '#/components/schemas/ChatMessage' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *   post:
 *     summary: Send message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body: { type: string, example: "Hello!" }
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Message sent" }
 *                 data: { $ref: '#/components/schemas/ChatMessage' }
 */
router.get('/conversations/:conversationId/messages', getMessagesValidation, getMessages);
router.post('/conversations/:conversationId/messages', sendMessageValidation, sendMessage);
/**
 * @swagger
 * /api/chat/conversations/{conversationId}/read:
 *   patch:
 *     summary: Mark conversation read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Conversation marked read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "success" }
 *                 message: { type: string, example: "Conversation marked as read" }
 *                 data: { type: object, properties: { markedCount: { type: integer } } }
 */
router.patch('/conversations/:conversationId/read', markConversationReadValidation, markConversationRead);
export default router;
//# sourceMappingURL=chat.routes.js.map