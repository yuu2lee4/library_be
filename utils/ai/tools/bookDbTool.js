import Book from '../../../models/book.js';

export const createBookDbTool = () => ({
    name: 'book_db_query',
    description: '查询系统中的馆藏书籍，只能查询书名、作者、ISBN、分类和借阅状态。',
    input: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            tag: { type: 'string' },
            borrowed: { type: 'boolean' },
            limit: { type: 'integer', minimum: 1, maximum: 20 }
        },
        additionalProperties: false
    },
    async execute(args = {}) {
        const filter = {};
        if (args.title) filter.title = new RegExp(args.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (args.author) filter.author = new RegExp(args.author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (args.isbn) filter.isbn = args.isbn.replace(/[-\s]/g, '');
        if (args.tag) filter.$or = [{ tag_1st: args.tag }, { tag_2nd: args.tag }];
        if (args.borrowed === true) filter.borrowers = { $not: { $size: 0 } };
        if (args.borrowed === false) filter.borrowers = { $size: 0 };

        const books = await Book.find(filter)
            .select('title author isbn tag_1st tag_2nd summary borrowers identifierList')
            .limit(Math.min(Math.max(args.limit || 10, 1), 20))
            .lean()
            .exec();

        return books.map(book => ({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            tags: [book.tag_1st, book.tag_2nd].filter(Boolean),
            summary: book.summary,
            totalCopies: book.identifierList?.length || 0,
            borrowedCopies: book.borrowers?.length || 0
        }));
    }
});