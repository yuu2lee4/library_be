import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID 格式不正确');
const pagination = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10)
});
const ids = z.object({
    ids: z.string().min(1, 'ids 不能为空')
});

export const bookIdParams = z.object({ id: objectId });
export const isbnParams = z.object({
    isbn: z.string().regex(/^(?:\d{10}|\d{13}|[\d\s-]{10,17})$/, 'ISBN 格式不正确')
});
export const bookListQuery = z.object({
    ids: z.string().min(1).optional()
});
export const bookSearchQuery = pagination.extend({
    title: z.string().optional()
});
export const bookSaveBody = z.object({
    _id: objectId.optional(),
    isbn: z.string().min(1, 'ISBN 不能为空'),
    detailURL: z.string().url().optional().or(z.literal('')),
    title: z.string().min(1, '书名不能为空'),
    author: z.string().optional(),
    identifierList: z.array(z.string()).optional(),
    image: z.string().url().optional().or(z.literal('')),
    summary: z.string().optional(),
    tag_1st: z.string().optional(),
    tag_2nd: z.string().optional()
});
export const bookIdsQuery = ids;