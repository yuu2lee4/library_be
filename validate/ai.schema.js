import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID 格式不正确');

export const conversationIdParams = z.object({
    id: objectId
});

export const chatBody = z.object({
    conversationId: objectId.optional(),
    message: z.string().trim().min(1, '问题不能为空').max(4000, '问题过长')
});