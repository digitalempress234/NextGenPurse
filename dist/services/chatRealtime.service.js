import { chatRealtimeQueue } from "../jobs/chatRealtime.queue.js";
import { config } from "../config/env.js";
const enqueueRealtimeEvent = async (event, conversationId, payload) => {
    try {
        await chatRealtimeQueue.add("chat-event", {
            event,
            conversationId: String(conversationId),
            payload,
        });
    }
    catch (error) {
        if (config.nodeEnv === "production") {
            throw error;
        }
        console.warn("[ChatRealtime] Queue unavailable, skipping realtime dispatch:", error.message);
    }
};
export const publishConversationMessage = async (conversationId, message) => {
    await enqueueRealtimeEvent("message", conversationId, {
        conversationId: String(conversationId),
        message,
        publishedAt: new Date().toISOString(),
    });
};
export const publishConversationRead = async (conversationId, payload) => {
    await enqueueRealtimeEvent("read", conversationId, {
        conversationId: String(conversationId),
        ...payload,
        publishedAt: new Date().toISOString(),
    });
};
// Kept for backward compatibility while clients migrate from SSE to Socket.IO.
export const addConversationStream = async () => { };
export const removeConversationStream = async () => { };
//# sourceMappingURL=chatRealtime.service.js.map