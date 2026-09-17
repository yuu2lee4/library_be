import mongoose from "mongoose";

const { Schema } = mongoose;

const AiMessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'AiConversation',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'tool'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    toolName: String,
    toolArgs: Schema.Types.Mixed,
    toolResult: Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('AiMessage', AiMessageSchema);