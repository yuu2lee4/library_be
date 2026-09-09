import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    getPinSchema,
    loginSchema,
    registerSchema
} from '../validate/user.schema.js';

describe('user schemas', () => {
    it('accepts valid registration data', () => {
        const result = registerSchema.safeParse({
            name: 'user@example.com',
            pin: 'a1b2c',
            password: 'abc123',
            repassword: 'abc123'
        });

        assert.equal(result.success, true);
    });

    it('rejects invalid email and mismatched passwords', () => {
        const result = registerSchema.safeParse({
            name: 'invalid-email',
            pin: 'a1b2c',
            password: 'abc123',
            repassword: 'abc456'
        });

        assert.equal(result.success, false);
        assert.deepEqual(
            result.error.issues.map(issue => issue.path),
            [['name'], ['repassword']]
        );
    });

    it('requires a boolean checkUser value', () => {
        const result = getPinSchema.safeParse({
            name: 'user@example.com',
            checkUser: 'true'
        });

        assert.equal(result.success, false);
    });

    it('rejects invalid login passwords', () => {
        const result = loginSchema.safeParse({
            name: 'user@example.com',
            password: 'short'
        });

        assert.equal(result.success, false);
    });
});