import * as User from "../controllers/user.js";
import Router from "@koa/router";
import * as auth from "../middwares/auth.js";
import { validate } from "../middwares/validate.js";
import { verifyPin } from "../middwares/verifyPin.js";
import {
	borrowSchema,
	getPinSchema,
	ldapLoginSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	returnSchema
} from "../validate/user.schema.js";

const router = new Router({ prefix: '/user' });
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
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/register', validate({ body: registerSchema }), verifyPin, User.register);
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
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/resetPassword', validate({ body: resetPasswordSchema }), verifyPin, User.resetPassword);
/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: 用户登录
 *     tags: [用户模块]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password]
 *             properties:
 *               name: { type: string, description: 账号 }
 *               password: { type: string, format: password, description: 密码 }
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/login', validate({ body: loginSchema }), User.login);
/**
 * @openapi
 * /user/ldapLogin:
 *   post:
 *     summary: LDAP 登录
 *     tags: [用户模块]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password]
 *             properties:
 *               name: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/ldapLogin', validate({ body: ldapLoginSchema }), User.ldapLogin);
/**
 * @openapi
 * /user/borrow:
 *   post:
 *     summary: 借阅书籍
 *     tags: [用户模块]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: 书籍 ID }
 *     responses:
 *       200:
 *         description: 借阅结果
 */
router.post('/borrow', auth.isLogin, validate({ body: borrowSchema }), User.borrow);
/**
 * @openapi
 * /user/return:
 *   post:
 *     summary: 归还书籍
 *     tags: [用户模块]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, description: 书籍 ID }
 *     responses:
 *       200:
 *         description: 归还结果
 */
router.post('/return', auth.isLogin, validate({ body: returnSchema }), User.return);
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
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/getPin', validate({ body: getPinSchema }), User.getPin);
/**
 * @openapi
 * /user:
 *   get:
 *     summary: 获取当前用户
 *     tags: [用户模块]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: 当前用户信息
 */
router.get('/', auth.isLogin, User.getUser);
/**
 * @openapi
 * /user/logout:
 *   get:
 *     summary: 用户退出
 *     tags: [用户模块]
 *     responses:
 *       200:
 *         description: 退出结果
 */
router.get('/logout', User.logout);
export default router;
