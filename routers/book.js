import * as Book from "../controllers/book.js";
import Router from "@koa/router";
import * as auth from "../middwares/auth.js";

const router = new Router({ prefix: '/book' });

/**
 * @openapi
 * /book:
 *   get:
 *     summary: 获取书籍列表
 *     tags: [书籍模块]
 *     parameters:
 *       - { name: ids, in: query, schema: { type: string }, description: 逗号分隔的书籍 ID }
 *     responses:
 *       200: { description: 书籍列表 }
 */
router.get('/', Book.list);
/**
 * @openapi
 * /book/isbn/{isbn}:
 *   get:
 *     summary: 根据 ISBN 获取书籍信息
 *     tags: [书籍模块]
 *     parameters:
 *       - { name: isbn, in: path, required: true, schema: { type: string }, description: ISBN-10 或 ISBN-13 }
 *     responses:
 *       200: { description: 书籍信息 }
 */
router.get('/isbn/:isbn', Book.getByISBN);
/**
 * @openapi
 * /book/search:
 *   get:
 *     summary: "获取书籍列表"
 *     tags: [书籍模块]
 *     parameters:
 *       - name: page
 *         description: 页码
 *         required: false
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         description: 页大小
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *       - name: title
 *         description: 书籍名，可模糊搜索
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     description: 获取书籍列表
 *     produces:
 *     responses:
 *       200:
 *         description: 查询成功
 */
router.get('/search', Book.search);
/**
 * @openapi
 * /book/getBorrowedBooks:
 *   get:
 *     summary: 获取借出书籍
 *     tags: [书籍模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { name: pageSize, in: query, schema: { type: integer, minimum: 1, default: 10 } }
 *     responses:
 *       200: { description: 借出书籍列表 }
 */
router.get('/getBorrowedBooks', Book.getBorrowedBooks);
/**
 * @openapi
 * /book/export:
 *   get:
 *     summary: 导出借阅记录
 *     tags: [书籍模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - { name: ids, in: query, schema: { type: string }, description: 逗号分隔的书籍 ID }
 *     responses:
 *       200: { description: 导出文件地址 }
 */
router.get('/export', Book.export);
/**
 * @openapi
 * /book/{id}:
 *   get:
 *     summary: 获取单本书籍
 *     tags: [书籍模块]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 书籍信息 }
 */
router.get('/:id', Book.get);
/**
 * @openapi
 * /book:
 *   post:
 *     summary: 新增或更新书籍
 *     tags: [书籍模块]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: 保存结果 }
 */
router.post('/', auth.isLogin, auth.isAdmin, Book.save);
/**
 * @openapi
 * /book/{id}:
 *   delete:
 *     summary: 删除单本书籍
 *     tags: [书籍模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: 删除结果 }
 */
router.delete('/:id', auth.isLogin, auth.isAdmin, Book.deleteOne);
/**
 * @openapi
 * /book:
 *   delete:
 *     summary: 批量删除书籍
 *     tags: [书籍模块]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - { name: ids, in: query, required: true, schema: { type: string }, description: 逗号分隔的书籍 ID }
 *     responses:
 *       200: { description: 删除结果 }
 */
router.delete('/', auth.isLogin, auth.isAdmin, Book.delete);
export default router;
