import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Agent } from '../utils/ai/agent.js';

describe('AI agent history', () => {
    it('passes recent conversation messages before the new question', async () => {
        let receivedMessages;
        const agent = new Agent({
            llm: {
                async chat({ messages }) {
                    receivedMessages = messages.map(message => ({ ...message }));
                    return { role: 'assistant', content: '回答' };
                }
            }
        });

        await agent.run('当前问题', [
            { role: 'user', content: '之前的问题' },
            { role: 'assistant', content: '之前的回答' }
        ]);

        assert.deepEqual(receivedMessages.map(message => message.content), [
            '你是图书管理系统的 AI 助手，只能回答书籍、作者、ISBN、馆藏、借阅和图书公开资料相关问题。\n非书籍问题必须拒绝回答。\n涉及当前馆藏或当前用户借阅信息时必须调用对应工具，不能猜测。\n需要实时公开资料时调用 web_search。\n不得请求、展示或推测密码、session、其他用户信息。\n每次只能选择一个动作。',
            '之前的问题',
            '之前的回答',
            '当前问题'
        ]);
    });
});