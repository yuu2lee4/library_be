import Router from '@koa/router';
import * as auth from '../middwares/auth.js';
import { validate } from '../middwares/validate.js';
import * as Ai from '../controllers/ai.js';
import { chatBody, conversationIdParams } from '../validate/ai.schema.js';

const router = new Router({ prefix: '/ai' });

/**
 * @openapi
 * /ai/conversations:
 *   get:
 *     summary: 获取当前用户的 AI 会话列表
 *     tags: [AI 模块]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: AI 会话列表
 *       401:
 *         description: 未登录
 */
router.get('/conversations', auth.isLogin, Ai.history);

/**
 * @openapi
 * /ai/conversations/{id}/messages:
 *   get:
 *     summary: 获取当前用户指定 AI 会话的消息
 *     tags: [AI 模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: AI 会话 ID
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     responses:
 *       200:
 *         description: 会话消息列表
 *       400:
 *         description: 会话 ID 格式错误
 *       401:
 *         description: 未登录
 *       404:
 *         description: 会话不存在或无权访问
 */
router.get('/conversations/:id/messages', auth.isLogin, validate({ params: conversationIdParams }), Ai.messages);

/**
 * @openapi
 * /ai/conversations/{id}:
 *   delete:
 *     summary: 删除当前用户的 AI 会话
 *     tags: [AI 模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: 删除成功 }
 *       401: { description: 未登录 }
 *       404: { description: 会话不存在或无权访问 }
 */
router.delete('/conversations/:id', auth.isLogin, validate({ params: conversationIdParams }), Ai.removeConversation);

/**
 * @openapi
 * /ai/chat:
 *   post:
 *     summary: 与图书管理 AI 对话
 *     description: 仅登录用户可用，使用 SSE 流式返回 Agent 状态、工具调用和回答。
 *     tags: [AI 模块]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: 已有 AI 会话 ID，不传则创建新会话
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4000
 *                 description: 书籍相关问题
 *           example:
 *             message: 馆里有没有《三体》？
 *     responses:
 *       200:
 *         description: SSE 流式响应
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *             example: |
 *               event: conversation
 *               data: {"conversationId":"64f000000000000000000001"}
 *
 *               event: answer
 *               data: {"content":"我正在查询馆藏信息。"}
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未登录
 */
router.post('/chat', auth.isLogin, validate({ body: chatBody }), Ai.chat);

export default router;