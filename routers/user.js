const User = require('../controllers/user')
const router = require('koa-router')({prefix : '/user'})


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
router.post('/borrow', User.borrow)
router.post('/return', User.return)
router.post('/getPin', User.getPin)
router.get('/', User.getUser)
router.get('/logout', User.logout)

module.exports = router