import * as User from "../controllers/user.mjs";
import koaRouter from "koa-router";
import * as auth from "../middwares/auth.mjs";

const router = koaRouter({ prefix: '/user' });
/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: "用户注册"
 *     tags: [用户模块]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - pin
 *               - password
 *               - repassword
 *             properties:
 *               name:
 *                 description: 账号
 *                 type: string
 *               pin:
 *                 description: 验证码
 *                 type: string
 *               password:
 *                 description: 密码
 *                 type: string
 *               repassword:
 *                 description: 重复密码
 *                 type: string
 *     description: 用户注册
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/register', User.register);
/**
 * @openapi
 * /user/resetPassword:
 *   post:
 *     summary: "重置密码"
 *     tags: [用户模块]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - pin
 *               - password
 *               - repassword
 *             properties:
 *               name:
 *                 description: 账号
 *                 type: string
 *               pin:
 *                 description: 验证码
 *                 type: string
 *               password:
 *                 description: 密码
 *                 type: string
 *               repassword:
 *                 description: 重复密码
 *                 type: string
 *     description: 密码重置
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/resetPassword', User.resetPassword);
router.post('/login', User.login);
router.post('/ldapLogin', User.ldapLogin);
router.post('/borrow', auth.isLogin, User.borrow);
router.post('/return', auth.isLogin, User.return);
/**
 * @openapi
 * /user/getPin:
 *   post:
 *     summary: "获取验证码"
 *     tags: [用户模块]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - checkUser
 *             properties:
 *               name:
 *                 description: 账号
 *                 type: string
 *               checkUser:
 *                 description: 是否校验用户(注册为false或找回密码为true)
 *                 type: boolean
 *     description: 获取验证码
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/getPin', User.getPin);
router.get('/', auth.isLogin, User.getUser);
router.get('/logout', User.logout);
export default router;
