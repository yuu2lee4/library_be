const User = require('../controllers/user')
const router = require('koa-router')({prefix : '/user'})

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