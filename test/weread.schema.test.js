import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wereadGatewayBody } from '../validate/weread.schema.js';

describe('weread gateway schema', () => {
    it('accepts a JSON object with arbitrary values', () => {
        const result = wereadGatewayBody.safeParse({
            action: 'search',
            options: { limit: 10 },
            enabled: true
        });

        assert.equal(result.success, true);
    });

    it('rejects non-object request bodies', () => {
        assert.equal(wereadGatewayBody.safeParse('invalid').success, false);
        assert.equal(wereadGatewayBody.safeParse([]).success, false);
        assert.equal(wereadGatewayBody.safeParse(null).success, false);
    });
});