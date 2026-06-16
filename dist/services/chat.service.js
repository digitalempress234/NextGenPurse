import prisma from "../config/prismaClient.js";
import { createHttpError } from "../utils/httpError.js";
import { toIntId, userPublicSelect, withMongoId } from "../utils/prismaHelpers.js";
import { publishConversationMessage, publishConversationRead } from "./chatRealtime.service.js";
const participantRoles = ["customer", "vendor", "rider"];
const pageArgs = (query = {}, defaultLimit = 20) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
};
const conversationInclude = {
    admin: { select: userPublicSelect },
    participant: { select: userPublicSelect },
    messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: userPublicSelect } },
    },
};
const ensureAuthenticatedUser = (user) => {
    if (!user?.id && !user?._id) {
        throw createHttpError("Authentication required", 401);
    }
};
const getUserId = (user) => toIntId(user.id ?? user._id, "user id");
const ensureParticipant = async (participantId) => {
    const participant = await prisma.user.findUnique({
        where: { id: participantId },
        select: userPublicSelect,
    });
    if (!participant || !participantRoles.includes(participant.role)) {
        throw createHttpError("Chat participant not found", 404);
    }
    if (!participant.isActive) {
        throw createHttpError("Cannot chat an inactive user", 400);
    }
    return participant;
};
const getConversationForUser = async (conversationId, userId) => {
    const conversation = await prisma.chatConversation.findFirst({
        where: {
            id: conversationId,
            OR: [{ adminId: userId }, { participantId: userId }],
        },
        include: conversationInclude,
    });
    if (!conversation)
        throw createHttpError("Conversation not found", 404);
    return conversation;
};
export const ensureConversationAccess = async (user, conversationIdValue) => {
    ensureAuthenticatedUser(user);
    const userId = getUserId(user);
    const conversationId = toIntId(conversationIdValue, "conversation id");
    const conversation = await getConversationForUser(conversationId, userId);
    return { userId, conversationId, conversation };
};
export const ensureAdminConversationAccess = ensureConversationAccess;
export const listChatUsers = async (requester, query = {}) => {
    ensureAuthenticatedUser(requester);
    if (requester.role === "admin") {
        return listAdminChatUsers(query);
    }
    const { search } = query;
    const where = {
        role: "admin",
        isActive: true,
    };
    if (search) {
        where.OR = [
            { firstName: { contains: String(search) } },
            { lastName: { contains: String(search) } },
            { email: { contains: String(search) } },
            { phoneNumber: { contains: String(search) } },
        ];
    }
    const { page, limit, skip } = pageArgs(query, 20);
    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: userPublicSelect,
            orderBy: [{ createdAt: "desc" }],
            skip,
            take: limit,
        }),
    ]);
    return {
        items: withMongoId(users),
        meta: { total, pages: Math.ceil(total / limit), page, limit },
    };
};
export const listAdminChatUsers = async (query = {}) => {
    const { role, search } = query;
    const where = {
        role: role && participantRoles.includes(role) ? role : { in: participantRoles },
        isActive: true,
    };
    if (search) {
        where.OR = [
            { firstName: { contains: String(search) } },
            { lastName: { contains: String(search) } },
            { email: { contains: String(search) } },
            { phoneNumber: { contains: String(search) } },
        ];
    }
    const { page, limit, skip } = pageArgs(query, 20);
    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: userPublicSelect,
            orderBy: [{ role: "asc" }, { createdAt: "desc" }],
            skip,
            take: limit,
        }),
    ]);
    return {
        items: withMongoId(users),
        meta: { total, pages: Math.ceil(total / limit), page, limit },
    };
};
export const listConversations = async (adminUser, query = {}) => {
    ensureAuthenticatedUser(adminUser);
    const userId = getUserId(adminUser);
    const { page, limit, skip } = pageArgs(query, 20);
    const where = {
        OR: [{ adminId: userId }, { participantId: userId }],
    };
    if (adminUser.role === "admin" && query.role && participantRoles.includes(query.role)) {
        where.participant = { role: query.role };
    }
    const [total, conversations] = await Promise.all([
        prisma.chatConversation.count({ where }),
        prisma.chatConversation.findMany({
            where,
            include: conversationInclude,
            orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
            skip,
            take: limit,
        }),
    ]);
    return {
        items: withMongoId(conversations),
        meta: { total, pages: Math.ceil(total / limit), page, limit },
    };
};
export const startConversation = async (adminUser, participantIdValue) => {
    ensureAuthenticatedUser(adminUser);
    const requesterId = getUserId(adminUser);
    const participantId = toIntId(participantIdValue, "participant id");
    if (requesterId === participantId) {
        throw createHttpError("Cannot start a conversation with yourself", 400);
    }
    let adminId = requesterId;
    let normalizedParticipantId = participantId;
    if (adminUser.role === "admin") {
        await ensureParticipant(participantId);
    }
    else {
        const adminTarget = await prisma.user.findUnique({
            where: { id: participantId },
            select: userPublicSelect,
        });
        if (!adminTarget || adminTarget.role !== "admin") {
            throw createHttpError("Only admin conversations are supported", 400);
        }
        if (!adminTarget.isActive) {
            throw createHttpError("Cannot chat an inactive admin", 400);
        }
        adminId = participantId;
        normalizedParticipantId = requesterId;
    }
    const conversation = await prisma.chatConversation.upsert({
        where: { adminId_participantId: { adminId, participantId: normalizedParticipantId } },
        create: { adminId, participantId: normalizedParticipantId },
        update: {},
        include: conversationInclude,
    });
    return withMongoId(conversation);
};
export const getMessages = async (adminUser, conversationIdValue, query = {}) => {
    const { conversationId } = await ensureConversationAccess(adminUser, conversationIdValue);
    const { page, limit, skip } = pageArgs(query, 50);
    const [total, messages] = await Promise.all([
        prisma.chatMessage.count({ where: { conversationId } }),
        prisma.chatMessage.findMany({
            where: { conversationId },
            include: { sender: { select: userPublicSelect } },
            orderBy: { createdAt: "asc" },
            skip,
            take: limit,
        }),
    ]);
    return {
        items: withMongoId(messages),
        meta: { total, pages: Math.ceil(total / limit), page, limit },
    };
};
export const sendMessage = async (adminUser, conversationIdValue, bodyValue) => {
    const { userId, conversationId } = await ensureConversationAccess(adminUser, conversationIdValue);
    const body = String(bodyValue || "").trim();
    if (!body)
        throw createHttpError("Message body is required", 400);
    if (body.length > 5000)
        throw createHttpError("Message body is too long", 400);
    const message = await prisma.$transaction(async (tx) => {
        const created = await tx.chatMessage.create({
            data: { conversationId, senderId: userId, body },
            include: { sender: { select: userPublicSelect } },
        });
        await tx.chatConversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: created.createdAt },
        });
        return created;
    });
    const response = withMongoId(message);
    await publishConversationMessage(conversationId, response);
    return response;
};
export const markConversationRead = async (adminUser, conversationIdValue) => {
    const { conversationId, userId } = await ensureConversationAccess(adminUser, conversationIdValue);
    const result = await prisma.chatMessage.updateMany({
        where: {
            conversationId,
            senderId: { not: userId },
            readAt: null,
        },
        data: { readAt: new Date() },
    });
    const payload = { markedRead: result.count };
    await publishConversationRead(conversationId, payload);
    return payload;
};
//# sourceMappingURL=chat.service.js.map