import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { publicUser } from '../controllers/user.js';

describe('user response sanitization', () => {
    it('removes the password hash from a Mongoose-like document', () => {
        const user = {
            toObject() {
                return {
                    _id: 'user-id',
                    name: 'reader@example.com',
                    password: 'password-hash'
                };
            }
        };

        assert.deepEqual(publicUser(user), {
            _id: 'user-id',
            name: 'reader@example.com'
        });
    });
});