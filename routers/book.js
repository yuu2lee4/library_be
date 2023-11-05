import * as Book from "../controllers/book.js";
import koaRouter from "koa-router";
import * as auth from "../middwares/auth.js";

const router = koaRouter({ prefix: '/book' });

router.get('/', Book.list);
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
 *         type: string
 *         default: 1
 *       - name: pageSize
 *         description: 页大小
 *         in: query
 *         required: false
 *         type: string
 *         default: 10
 *       - name: title
 *         description: 书籍名，可模糊搜索
 *         in: query
 *         required: false
 *         type: string
 *     description: 获取书籍列表
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get('/search', Book.search);
router.get('/getBorrowedBooks', Book.getBorrowedBooks);
router.get('/export', Book.export);
router.get('/:id', Book.get);
router.post('/', auth.isLogin, auth.isAdmin, Book.save);
router.delete('/:id', auth.isLogin, auth.isAdmin, Book.deleteOne);
router.delete('/', auth.isLogin, auth.isAdmin, Book.delete);
export default router;
