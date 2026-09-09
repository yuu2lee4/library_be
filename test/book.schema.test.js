import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    bookIdsQuery,
    bookSaveBody,
    bookSearchQuery,
    isbnParams
} from '../validate/book.schema.js';

describe('book schemas', () => {
    it('accepts ISBN-10 and ISBN-13 values', () => {
        assert.equal(isbnParams.safeParse({ isbn: '0306406152' }).success, true);
        assert.equal(isbnParams.safeParse({ isbn: '9780306406157' }).success, true);
    });

    it('accepts ISBN values containing spaces or hyphens', () => {
        const result = isbnParams.safeParse({ isbn: '978-0-306-40615-7' });

        assert.equal(result.success, true);
    });

    it('rejects invalid ISBN and empty ids', () => {
        assert.equal(isbnParams.safeParse({ isbn: '123' }).success, false);
        assert.equal(bookIdsQuery.safeParse({ ids: '' }).success, false);
    });

    it('coerces pagination values and applies defaults', () => {
        const result = bookSearchQuery.parse({});

        assert.deepEqual(result, { page: 1, pageSize: 10 });
        assert.deepEqual(
            bookSearchQuery.parse({ page: '2', pageSize: '20', title: 'node' }),
            { page: 2, pageSize: 20, title: 'node' }
        );
    });

    it('validates a book payload', () => {
        const result = bookSaveBody.safeParse({
            isbn: '9780306406157',
            title: 'A book',
            author: 'An author',
            identifierList: ['copy-1']
        });

        assert.equal(result.success, true);
    });
});