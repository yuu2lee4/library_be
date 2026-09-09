import Router from "@koa/router";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const router = new Router();
const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.3',
        info: {
            title: '鲲鹏图书借阅系统 API',
            version: '1.0.0',
        },
        servers: [
            { url: '/api' },
        ],
        tags: [
            { name: '用户模块' },
            { name: '书籍模块' },
            { name: '标签模块' },
            { name: '微信读书模块' },
        ],
        components: {
            securitySchemes: {
                sessionCookie: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'koa:sess',
                    description: '登录后由服务端写入的 session cookie',
                },
            },
        },
    },
    apis: [
        path.join(import.meta.dirname, "*.js"),
    ]
};
const swaggerSpec = swaggerJSDoc(options);
router.prefix('/swagger');
router.get('/swagger.json', async function (ctx) {
    ctx.type = 'application/json';
    ctx.body = swaggerSpec;
});
export { swaggerSpec };
export default router;
