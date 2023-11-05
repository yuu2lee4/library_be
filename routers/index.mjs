import koaRouter from "koa-router";
import book from "./book.mjs";
import tag from "./tag.mjs";
import user from "./user.mjs";

const api = koaRouter();
api.use(book.routes());
api.use(tag.routes());
api.use(user.routes());

export default api.use('/api', api.routes(), api.allowedMethods());
