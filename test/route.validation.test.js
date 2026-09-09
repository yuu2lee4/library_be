import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import Koa from 'koa';
import bodyParser from '@koa/bodyparser';
import router from '../routers/index.js';

let server;
let baseUrl;

before(async () => {
    const app = new Koa();
    app.use(bodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());

    server = http.createServer(app.callback());
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
    });
});

const request = (path, options = {}) => fetch(`${baseUrl}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options
});

describe('route validation', () => {
    it('rejects invalid user login input with HTTP 400', async () => {
        const response = await request('/api/user/login', {
            method: 'POST',
            body: JSON.stringify({ name: 'invalid', password: 'x' })
        });
        const body = await response.json();

        assert.equal(response.status, 400);
        assert.equal(body.code, 400);
        assert.equal(body.msg, '请求参数错误');
    });

    it('rejects invalid book search pagination', async () => {
        const response = await request('/api/book/search?page=0&pageSize=101');

        assert.equal(response.status, 400);
    });

    it('rejects an invalid tag path id', async () => {
        const response = await request('/api/tag/not-an-object-id');

        assert.equal(response.status, 400);
    });

    it('rejects an array WeRead gateway body', async () => {
        const response = await request('/api/weread/gateway', {
            method: 'POST',
            body: JSON.stringify([])
        });

        assert.equal(response.status, 400);
    });
});