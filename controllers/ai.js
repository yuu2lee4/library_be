import { PassThrough } from 'node:stream';
import AiConversation from '../models/aiConversation.js';
import AiMessage from '../models/aiMessage.js';
import { Agent } from '../utils/ai/agent.js';
import { LLM } from '../utils/ai/llm.js';
import { createBookDbTool } from '../utils/ai/tools/bookDbTool.js';
import { createMyBorrowedBooksTool } from '../utils/ai/tools/myBorrowedBooksTool.js';
import { createWebSearchTool } from '../utils/ai/tools/webSearchTool.js';

const getUserId = ctx => ctx.session.user._id.toString();
const normalizeMessage = content => String(content || '').trim();

const getConversation = async (ctx, id) => {
    if (!id) return AiConversation.create({ userId: getUserId(ctx) });
    return AiConversation.findOne({ _id: id, userId: getUserId(ctx), status: 'active' }).exec();
};

const getRecentMessages = conversationId => AiMessage.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('role content')
    .lean()
    .exec()
    .then(messages => messages.reverse());

const createConversationTitle = message => message.replace(/\s+/g, ' ').trim().slice(0, 24) || '新对话';

const fillConversationTitle = async conversation => {
    if (conversation.title !== '新对话') return conversation;
    const firstMessage = await AiMessage.findOne({ conversationId: conversation._id, role: 'user' })
        .sort({ createdAt: 1 })
        .select('content')
        .lean()
        .exec();
    if (!firstMessage) return conversation;
    const title = createConversationTitle(firstMessage.content);
    await AiConversation.updateOne({ _id: conversation._id }, { title });
    conversation.title = title;
    return conversation;
};

export const history = async ctx => {
    const conversations = await AiConversation.find({ userId: getUserId(ctx) })
        .sort({ lastMessageAt: -1 })
        .limit(50)
        .lean()
        .exec();
    ctx.body = { code: 0, data: await Promise.all(conversations.map(fillConversationTitle)) };
};

export const messages = async ctx => {
    const conversation = await getConversation(ctx, ctx.params.id);
    if (!conversation) {
        ctx.status = 404;
        ctx.body = { code: 404, msg: '会话不存在' };
        return;
    }
    ctx.body = {
        code: 0,
        data: await AiMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).lean().exec()
    };
};

export const removeConversation = async ctx => {
    const conversation = await getConversation(ctx, ctx.params.id);
    if (!conversation) {
        ctx.status = 404;
        ctx.body = { code: 404, msg: '会话不存在或无权访问' };
        return;
    }

    await AiMessage.deleteMany({ conversationId: conversation._id });
    await AiConversation.deleteOne({ _id: conversation._id });
    ctx.body = { code: 0, data: true };
};

export const chat = async ctx => {
    const { message: rawMessage, conversationId } = ctx.state.input.body;
    const message = normalizeMessage(rawMessage);
    const conversation = await getConversation(ctx, conversationId);
    if (!conversation) {
        ctx.status = 404;
        ctx.body = { code: 404, msg: '会话不存在或无权访问' };
        return;
    }

    const recentMessages = await getRecentMessages(conversation._id);
    if (conversation.title === '新对话') {
        conversation.title = createConversationTitle(message);
        await conversation.save();
    }
    await AiMessage.create({ conversationId: conversation._id, role: 'user', content: normalizeMessage(message) });
    const stream = new PassThrough();
    ctx.status = 200;
    ctx.type = 'text/event-stream';
    ctx.set({
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
    });
    ctx.body = stream;

    const send = (event, data) => {
        if (!stream.destroyed) {
            stream.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    };
    send('conversation', { conversationId: conversation._id });

    (async () => {
        try {
            const agent = new Agent({
                llm: new LLM(),
                tools: [
                    createBookDbTool(),
                    createMyBorrowedBooksTool({ userId: getUserId(ctx) }),
                    createWebSearchTool()
                ],
                onEvent: send
            });
            const answer = await agent.run(message, recentMessages);
            await AiMessage.create({ conversationId: conversation._id, role: 'assistant', content: normalizeMessage(answer) });
            await AiConversation.updateOne({ _id: conversation._id }, { lastMessageAt: new Date() });
            send('done', { conversationId: conversation._id });
        }
        catch (error) {
            send('error', { message: error.message });
        }
        finally {
            stream.end();
        }
    })();
};