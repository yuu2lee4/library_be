import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import mongoose from "mongoose";
import serve from "koa-static";
import session from "koa-session-minimal";
import MongoStore from "@naviocean/koa-generic-session-mongo";
import router from "./routers/index.js";
import { koaSwagger } from "koa2-swagger-ui";
import swagger from "./routers/swagger.js";
import config from "config";

const { dirname } =  import.meta;

const databaseConfig = config.get('mongo');

const app = new Koa();
app.keys = ['keys', 'keykeys'];
const errorHandler = async (ctx, next) => {
    try {
        await next();
    }
    catch (error) {
        console.error(error);
        ctx.status = error.status || 500;
        ctx.body = {
            code: ctx.status,
            msg: ctx.status === 500 ? '服务器内部错误' : error.message
        };
    }
};

app.use(errorHandler)
    .use(swagger.routes(), swagger.allowedMethods())
    .use(koaSwagger({
        routePrefix: '/swagger',
        swaggerOptions: {
            url: '/swagger/swagger.json',
        },
    }))
    .use(bodyParser())
    .use(serve(dirname + '/upload'))
    .use(serve(dirname + '/library_fe/dist'))
    .use(session({
        cookie: ctx => ({
            maxAge: ctx.session.pin ? 2 * 60 * 1000 : 24 * 60 * 60 * 1000
        }),
        store: new MongoStore({
            url: databaseConfig.url
        }),
    }))
    .use(router.routes())
    .use(router.allowedMethods());
    
const { url, port } = config.get('server');

const start = async () => {
    try {
        await mongoose.connect(databaseConfig.url);
        console.log('database connected');

        app.listen(port, () => {
            console.log(`app start : ${url}:${port}`);
        });
    }
    catch (error) {
        console.error('database connection failed:', error);
        process.exit(1);
    }
};

start();
