const User = require('../controllers/user')
const router = require('koa-router')({prefix : '/user'})
const auth = require('../middwares/auth')

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: "用户注册" 
 *     tags: [用户模块]
 *     parameters: 
 *       - name: name
 *         description: 账号
 *         required: true
 *         in: query
 *         type: string
 *       - name: password
 *         description: 密码
 *         in: query
 *         required: true
 *         type: string
 *     description: 用户注册
 *     produces: 
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/register', User.register)
router.post('/resetPassword', User.resetPassword)
router.post('/login', User.login)
router.post('/ldapLogin', User.ldapLogin)
router.post('/borrow', auth.isLogin, User.borrow)
router.post('/return', auth.isLogin, User.return)
router.post('/getPin', User.getPin)
router.get('/', auth.isLogin, User.getUser)
router.get('/logout', User.logout)

module.exports = router