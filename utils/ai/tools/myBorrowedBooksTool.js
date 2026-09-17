import Book from '../../../models/book.js';
import User from '../../../models/user.js';

export const createMyBorrowedBooksTool = ({ userId }) => ({
    name: 'get_my_borrowed_books',
    description: '查询当前登录用户自己借阅中的书籍，不接受 userId 参数。',
    input: {
        type: 'object',
        properties: {},
        additionalProperties: false
    },
    async execute() {
        const user = await User.findById(userId).select('borrowedBooks').lean().exec();
        if (!user) return [];

        const borrowedById = new Map(
            user.borrowedBooks.map(item => [item.id.toString(), item])
        );
        const books = await Book.find({ _id: { $in: [...borrowedById.keys()] } })
            .select('title author isbn borrowers')
            .lean()
            .exec();

        return books.map(book => ({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            identifier: borrowedById.get(book._id.toString())?.identifier,
            date: borrowedById.get(book._id.toString())?.date
        }));
    }
});