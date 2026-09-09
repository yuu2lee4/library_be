import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    tagIdsQuery,
    tagSaveBody,
    tagSearchQuery
} from '../validate/tag.schema.js';

describe('tag schemas', () => {
    it('accepts a valid tag payload', () => {
        const result = tagSaveBody.safeParse({
            name: '文学',
            tags_2nd: ['小说']
        });

        assert.equal(result.success, true);
    });

    it('rejects an empty tag name and ids', () => {
        assert.equal(tagSaveBody.safeParse({ name: '' }).success, false);
        assert.equal(tagIdsQuery.safeParse({ ids: '' }).success, false);
    });

    it('applies pagination defaults and rejects invalid page sizes', () => {
        assert.deepEqual(tagSearchQuery.parse({}), {
            page: 1,
            pageSize: 10
        });
        assert.equal(
            tagSearchQuery.safeParse({ page: '0', pageSize: '101' }).success,
            false
        );
    });
});