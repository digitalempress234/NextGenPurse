import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['customer', 'vendor', 'rider', 'admin'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
}, {timestamps: true});

// Indexes for performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);
