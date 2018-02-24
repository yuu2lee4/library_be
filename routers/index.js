const api = require('koa-router')()
const book = require('./book')
const tag = require('./tag')
const user = require('./user')

api.use(book.routes());
api.use(tag.routes());
api.use(user.routes());

module.exports = api.use('/api',
                  api.routes(),
                  api.allowedMethods());