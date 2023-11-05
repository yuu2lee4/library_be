import * as Tag from "../controllers/tag.mjs";
import koaRouter from "koa-router";
import * as auth from "../middwares/auth.mjs";

const router = koaRouter({ prefix: '/tag' });

router.get('/', Tag.list);
router.get('/search', Tag.search);
router.get('/:id', Tag.get);
router.post('/', auth.isLogin, auth.isAdmin, Tag.save);
router.delete('/', auth.isLogin, auth.isAdmin, Tag.delete);
export default router;
