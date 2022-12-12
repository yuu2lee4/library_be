const Book = require('../controllers/book')
const router = require('koa-router')({prefix : '/book'})
const auth = require('../middwares/auth')

router.get('/', Book.list)
router.get('/isbn/:isbn', Book.getByISBN)
router.get('/search', Book.search)
router.get('/getBorrowedBooks', Book.getBorrowedBooks)
router.get('/export', Book.export)
router.get('/:id', Book.get)
router.post('/', auth.isAdmin, Book.save)
router.delete('/:id', auth.isAdmin, Book.deleteOne)
router.delete('/', auth.isAdmin, Book.delete)

module.exports = router;