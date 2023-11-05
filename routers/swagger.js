import koaRouter from "koa-router";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import createEsmUtils from 'esm-utils';

const { dirname } = createEsmUtils(import.meta);

const router = koaRouter();
const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: '接口文档',
            version: '1.0.0',
        },
    },
    //写有注解的router的存放地址, 最好使用path.join(),这里使用物理路径
    apis: [
        path.join(dirname, "./*.js"),
    ]
};
const swaggerSpec = swaggerJSDoc(options);
router.prefix('/swagger'); //设置路由，与app.js中的路由配置保持一致
// 通过路由获取生成的注解文件
router.get('/swagger.json', async function (ctx) {
    ctx.set('Content-Type', 'application/json');
    ctx.body = swaggerSpec;
});
export default router;
