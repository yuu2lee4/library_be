import * as Tag from "../controllers/tag.js";
import Router from "@koa/router";
import * as auth from "../middwares/auth.js";
import { validate } from "../middwares/validate.js";
import {
	tagIdParams,
	tagIdsQuery,
	tagListQuery,
	tagSaveBody,
	tagSearchQuery
} from "../validate/tag.schema.js";

const router = new Router({ prefix: '/tag' });

/**
 * @openapi
 * /tag:
 *   get:
 *     summary: 获取标签列表
 *     tags: [标签模块]
 *     responses:
 *       200: { description: 标签列表 }
 */
router.get('/', validate({ query: tagListQuery }), Tag.list);
/**
 * @openapi
 * /tag/search:
 *   get:
 *     summary: 搜索标签
 *     tags: [标签模块]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { name: pageSize, in: query, schema: { type: integer, minimum: 1, default: 10 } }
 *     responses:
 *       200: { description: 标签列表 }
 */
router.get('/search', validate({ query: tagSearchQuery }), Tag.search);
/**
 * @openapi
 * /tag/{id}:
 *   get:
 *     summary: 获取单个标签
 *     tags: [标签模块]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 标签信息 }
 */
router.get('/:id', validate({ params: tagIdParams }), Tag.get);
/**
 * @openapi
 * /tag:
 *   post:
 *     summary: 新增或更新标签
 *     tags: [标签模块]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: 保存结果 }
 */
router.post('/', auth.isLogin, auth.isAdmin, validate({ body: tagSaveBody }), Tag.save);
/**
 * @openapi
 * /tag:
 *   delete:
 *     summary: 批量删除标签
 *     tags: [标签模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - { name: ids, in: query, required: true, schema: { type: string }, description: 逗号分隔的标签 ID }
 *     responses:
 *       200: { description: 删除结果 }
 */
router.delete('/', auth.isLogin, auth.isAdmin, validate({ query: tagIdsQuery }), Tag.delete);
export default router;
