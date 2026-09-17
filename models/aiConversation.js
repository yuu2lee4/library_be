import mongoose from "mongoose";

const { Schema } = mongoose;

const AiConversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: '新对话'
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('AiConversation', AiConversationSchema);