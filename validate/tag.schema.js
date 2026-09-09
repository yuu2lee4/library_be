import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID 格式不正确');

export const tagIdParams = z.object({ id: objectId });
export const tagListQuery = z.object({
    ids: z.string().min(1).optional()
});
export const tagSearchQuery = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10)
});
export const tagSaveBody = z.object({
    _id: objectId.optional(),
    name: z.string().min(1, '标签名不能为空'),
    tags_2nd: z.array(z.unknown()).optional()
});
export const tagIdsQuery = z.object({
    ids: z.string().min(1, 'ids 不能为空')
});