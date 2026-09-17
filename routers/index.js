import Router from "@koa/router";
import book from "./book.js";
import tag from "./tag.js";
import user from "./user.js";
import weread from "./weread.js";
import ai from "./ai.js";

const api = new Router();
api.use(book.routes());
api.use(tag.routes());
api.use(user.routes());
api.use(weread.routes());
api.use(ai.routes());

export default api.use('/api', api.routes(), api.allowedMethods());
