import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../middwares/validate.js';
import { verifyPin } from '../middwares/verifyPin.js';
import { createRateLimiter } from '../middwares/rateLimit.js';
import { loginSchema } from '../validate/user.schema.js';

const contextFor = body => ({
    request: { body },
    query: {},
    params: {},
    state: {}
});

describe('validate middleware', () => {
    it('stores parsed data and calls next for valid input', async () => {
        const ctx = contextFor({
            name: 'user@example.com',
            password: 'abc123'
        });
        let nextCalled = false;

        await validate({ body: loginSchema })(ctx, async () => {
            nextCalled = true;
        });

        assert.equal(nextCalled, true);
        assert.deepEqual(ctx.state.input.body, {
            name: 'user@example.com',
            password: 'abc123'
        });
    });

    it('returns 400 and stops for invalid input', async () => {
        const ctx = contextFor({
            name: 'invalid-email',
            password: 'x'
        });
        let nextCalled = false;

        await validate({ body: loginSchema })(ctx, async () => {
            nextCalled = true;
        });

        assert.equal(ctx.status, 400);
        assert.equal(ctx.body.code, 400);
        assert.equal(ctx.body.msg, '请求参数错误');
        assert.equal(ctx.body.errors.length, 2);
        assert.equal(nextCalled, false);
    });
});

describe('verifyPin middleware', () => {
    const validInput = {
        name: 'user@example.com',
        pin: 'a1b2c'
    };

    it('returns 205 when the pin session is missing', async () => {
        const ctx = {
            state: { input: { body: validInput } },
            session: {}
        };
        let nextCalled = false;

        await verifyPin(ctx, async () => {
            nextCalled = true;
        });

        assert.equal(ctx.status, 400);
        assert.equal(ctx.body.code, 205);
        assert.equal(nextCalled, false);
    });

    it('returns 207 for an incorrect pin', async () => {
        const ctx = {
            state: { input: { body: validInput } },
            session: { pin: { code: 'WRONG', email: validInput.name } }
        };

        await verifyPin(ctx, async () => {
            throw new Error('next should not be called');
        });

        assert.equal(ctx.status, 400);
        assert.equal(ctx.body.code, 207);
    });

    it('returns 208 when the email does not match', async () => {
        const ctx = {
            state: { input: { body: validInput } },
            session: { pin: { code: 'A1B2C', email: 'other@example.com' } }
        };

        await verifyPin(ctx, async () => {
            throw new Error('next should not be called');
        });

        assert.equal(ctx.status, 400);
        assert.equal(ctx.body.code, 208);
    });

    it('calls next for a matching pin and email', async () => {
        const ctx = {
            state: { input: { body: validInput } },
            session: { pin: { code: 'A1B2C', email: validInput.name } }
        };
        let nextCalled = false;

        await verifyPin(ctx, async () => {
            nextCalled = true;
        });

        assert.equal(nextCalled, true);
    });
});

describe('rate limit middleware', () => {
    it('returns 429 after reaching the request limit', async () => {
        const rateLimiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
        const context = {
            ip: '127.0.0.1',
            session: {},
            set(name, value) {
                this.headers = { ...this.headers, [name]: value };
            }
        };

        await rateLimiter(context, async () => {});
        await rateLimiter(context, async () => {
            throw new Error('next should not be called');
        });

        assert.equal(context.status, 429);
        assert.equal(context.body.code, 429);
        assert.equal(context.headers['Retry-After'], '60');
    });
});