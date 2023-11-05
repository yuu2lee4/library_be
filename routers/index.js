import koaRouter from "koa-router";
import book from "./book.js";
import tag from "./tag.js";
import user from "./user.js";

const api = koaRouter();
api.use(book.routes());
api.use(tag.routes());
api.use(user.routes());

export default api.use('/api', api.routes(), api.allowedMethods());
