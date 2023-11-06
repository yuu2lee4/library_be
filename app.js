import Koa from "koa";
import bodyParser from "koa-bodyparser";
import mongoose from "mongoose";
import serve from "koa-static";
import session from "koa-session-minimal";
import MongoStore from "koa-generic-session-mongo";
import scheme from "koa-scheme";
import errorHandler from "koa-handle-error";
import path from "path";
import router from "./routers/index.js";
import { koaSwagger } from "koa2-swagger-ui";
import swagger from "./routers/swagger.js";
import config from "config";
import createEsmUtils from 'esm-utils'

const { dirname } = createEsmUtils(import.meta)

const databaseConfig = config.get('mongo');
mongoose.connect(`mongodb://${databaseConfig.url}/${databaseConfig.name}`);

const app = new Koa();
app.keys = ['keys', 'keykeys'];
const onError = err => {
    console.error(err);
};
app.use(errorHandler(onError))
    .use(swagger.routes(), swagger.allowedMethods())
    .use(koaSwagger({
        routePrefix: '/swagger',
        swaggerOptions: {
            url: 'swagger/swagger.json',
        },
    }))
    .use(bodyParser())
    .use(serve(dirname + '/upload'))
    .use(serve(path.join(dirname, '/library_fe/dist')))
    .use(session({
    cookie: ctx => ({
        maxAge: ctx.session.pin ? 2 * 60 * 1000 : 24 * 60 * 60 * 1000
    }),
    store: new MongoStore()
}))
    .use(scheme(path.join(dirname + '/validate/scheme.cjs'), { debug: true }))
    .use(router.routes())
    .use(router.allowedMethods());
    
const { url, port } = config.get('server');
app.listen(port, () => {
    console.log(`app start : ${url}:${port}`);
});
