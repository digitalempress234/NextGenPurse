import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import { redisPublisher } from "../config/redis.js";
import { config } from "../config/env.js";
import { startChatRealtimeWorker } from "../jobs/chatRealtime.queue.js";
let ioInstance;
const conversationRoom = (conversationId) => `chat:conversation:${conversationId}`;
const decodeToken = (socket) => {
    const authHeader = socket.handshake.headers?.authorization;
    const authToken = socket.handshake.auth?.token;
    const token = authToken || authHeader?.split(" ")[1];
    if (!token)
        return null;
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded || typeof decoded === "string")
            return null;
        return decoded;
    }
    catch {
        return null;
    }
};
const loadUser = async (userId) => {
    if (!Number.isInteger(userId))
        return null;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
            isActive: true,
            email: true,
            firstName: true,
            lastName: true,
        },
    });
    if (!user || !user.isActive)
        return null;
    return user;
};
const hasConversationAccess = async (conversationId, userId) => {
    const conversation = await prisma.chatConversation.findFirst({
        where: {
            id: conversationId,
            OR: [{ adminId: userId }, { participantId: userId }],
        },
        select: { id: true },
    });
    return Boolean(conversation);
};
export const initializeChatSocket = async (httpServer) => {
    let redisEnabled = false;
    ioInstance = new Server(httpServer, {
        cors: {
            origin: config.clientUrl,
            credentials: true,
        },
    });
    if (config.nodeEnv !== "test") {
        const formatRedisError = (err) => err?.message || err?.code || String(err);
        const redisAdapterOptions = {
            retryStrategy: () => null,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
        };
        const pubClient = redisPublisher.duplicate(redisAdapterOptions);
        const subClient = redisPublisher.duplicate(redisAdapterOptions);
        pubClient.on("error", (err) => {
            console.error("[Socket.IO Redis] Publisher error:", formatRedisError(err));
        });
        subClient.on("error", (err) => {
            console.error("[Socket.IO Redis] Subscriber error:", formatRedisError(err));
        });
        try {
            await Promise.all([pubClient.connect(), subClient.connect()]);
            ioInstance.adapter(createAdapter(pubClient, subClient));
            redisEnabled = true;
        }
        catch (error) {
            pubClient.disconnect();
            subClient.disconnect();
            if (config.nodeEnv === "production") {
                throw new Error(`Redis is required in production for realtime chat: ${error.message}`);
            }
            console.warn("[Socket.IO] Redis is unavailable. Running without distributed socket adapter in development.");
        }
    }
    ioInstance.use(async (socket, next) => {
        const decoded = decodeToken(socket);
        if (!decoded?.id)
            return next(new Error("Unauthorized"));
        const user = await loadUser(Number.parseInt(String(decoded.id), 10));
        if (!user)
            return next(new Error("Unauthorized"));
        socket.data.user = user;
        next();
    });
    ioInstance.on("connection", (socket) => {
        socket.on("chat:join", async ({ conversationId }) => {
            const parsedConversationId = Number.parseInt(String(conversationId), 10);
            if (!Number.isInteger(parsedConversationId))
                return;
            const userId = socket.data.user.id;
            const allowed = await hasConversationAccess(parsedConversationId, userId);
            if (!allowed)
                return;
            socket.join(conversationRoom(parsedConversationId));
            socket.emit("chat:joined", { conversationId: String(parsedConversationId) });
        });
        socket.on("chat:leave", ({ conversationId }) => {
            const parsedConversationId = Number.parseInt(String(conversationId), 10);
            if (!Number.isInteger(parsedConversationId))
                return;
            socket.leave(conversationRoom(parsedConversationId));
        });
    });
    if (config.nodeEnv === "test" || redisEnabled) {
        startChatRealtimeWorker(({ event, conversationId, payload }) => {
            if (!ioInstance)
                return;
            ioInstance.to(conversationRoom(conversationId)).emit(`chat:${event}`, payload);
        });
    }
    return ioInstance;
};
export const getChatSocket = () => ioInstance;
//# sourceMappingURL=chatSocket.service.js.map