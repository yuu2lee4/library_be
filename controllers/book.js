import Book from "../models/book.js";
import fs from "fs/promises";
import xlsx from 'node-xlsx';
import { format } from "date-fns";
import path from "path";
import config from "config";

export const save = async (ctx) => {
    const id = ctx.request.body._id;
    if (id) {
        const book = await Book.findById(id);
        Object.assign(book, ctx.request.body);
        await book.save();
        ctx.body = { code: 0, data: true };
    }
    else {
        const isbn = ctx.request.body.isbn;
        const book = await Book.findOne({ isbn: isbn }).exec();
        if (book) {
            ctx.body = { code: 100, msg: '该书籍已存在！' };
        }
        else {
            const newBook = await Book.create(ctx.request.body);
            if (newBook) {
                ctx.body = { code: 0, data: true };
            }
        }
    }
};
export const get = async (ctx) => {
    const id = ctx.params.id;
    const book = await Book.findOne({ _id: id }).exec();
    if (book) {
        ctx.body = { code: 0, data: book };
    }
};
export const list = async (ctx) => {
    let book;
    if (ctx.query.ids) {
        const ids = ctx.query.ids.split(',');
        book = await Book.find({ _id: { $in: ids } }).sort({
            'meta.updateAt': -1,
        }).exec();
    }
    else {
        book = await Book.find().sort({
            'meta.updateAt': -1,
        }).exec();
    }
    if (book) {
        ctx.body = { code: 0, data: book };
    }
};
export const search = async (ctx) => {
    const pageSize = ctx.query.pageSize * 1 || 10;
    const page = ctx.query.page * 1 || 1;
    const skipNum = (page - 1) * pageSize;
    const searchBookPromise = Book.find({ title: new RegExp(ctx.query.title, 'i') }).limit(pageSize).skip(skipNum).sort({
        'meta.updateAt': -1,
    }).exec();
    const countNumerPromise = Book.count({ title: new RegExp(ctx.query.title, 'i') });
    const [books, total] = await Promise.all([searchBookPromise, countNumerPromise]);
    if (books.length) {
        ctx.body = {
            code: 0,
            data: {
                results: books,
                page,
                pageSize,
                total
            }
        };
    }
    else {
        ctx.body = { code: 101, msg: '未查询到书籍!' };
    }
};
export const getBorrowedBooks = async (ctx) => {
    const pageSize = ctx.query.pageSize * 1 || 10;
    const page = ctx.query.page * 1 || 1;
    const skipNum = (page - 1) * pageSize;
    const searchBookPromise = Book.find({ borrowers: { $not: { $size: 0 } } }).limit(pageSize).skip(skipNum).sort({
        'meta.updateAt': -1,
    }).exec();
    const countNumerPromise = Book.count({ borrowers: { $not: { $size: 0 } } });
    const [books, total] = await Promise.all([searchBookPromise, countNumerPromise]);
    if (books.length) {
        ctx.body = {
            code: 0,
            data: {
                results: books,
                page,
                pageSize,
                total
            }
        };
    }
    else {
        ctx.body = { code: 102, msg: '没有借出的书籍!' };
    }
};
const export$0 = async (ctx) => {
    let books;
    if (ctx.query.ids) {
        const ids = ctx.query.ids.split(',');
        books = await Book.find({ _id: { $in: ids } }).sort({
            'meta.updateAt': -1,
        }).exec();
    }
    else {
        books = await Book.find({ borrowers: { $not: { $size: 0 } } }).sort({
            'meta.updateAt': -1,
        }).exec();
    }
    if (books) {
        const exportData = [[
                'id',
                '书名',
                'ISBN',
                '作者',
                '借书人',
                '书籍编号',
                '借出时间'
            ]];
        for (const book of books) {
            for (const borrower of book.borrowers) {
                exportData.push([
                    book._id,
                    book.title,
                    book.isbn,
                    book.author,
                    borrower.name,
                    borrower.identifier,
                    borrower.date
                ]);
            }
        }
        const buffer = xlsx.build([{ name: "借出列表", data: exportData }]);
        const filename = `借书人列表-${format(new Date(), 'yyyy-MM-ddTHH-mm-ss')}.xlsx`;
        await fs.writeFile(path.resolve('upload', filename), buffer);
        const { url, port } = config.get('server');
        ctx.body = { code: 0, data: `${url}:${port}/${filename}` };
    }
};
export const deleteOne = async (ctx) => {
    const id = ctx.params.id;
    await Book.deleteOne({ _id: id }).exec();
    ctx.body = { code: 0, data: true };
};
const delete$0 = async (ctx) => {
    const ids = ctx.query.ids.split(',');
    await Book.deleteMany({ _id: { $in: ids } }).exec();
    ctx.body = { code: 0, data: true };
};
export const getByISBN = async (ctx) => {
    const isbn = ctx.params.isbn.replace(/[-\s]/g, '');
    if (!/^(?:\d{10}|\d{13})$/.test(isbn)) {
        ctx.body = { code: 103, msg: 'ISBN格式不正确' };
        return;
    }

    try {
        const openLibraryURL = config.get('openLibrary.url');
        const openLibraryCoverURL = config.get('openLibrary.coverURL');
        const searchRes = await fetch(`${openLibraryURL}/search.json?isbn=${encodeURIComponent(isbn)}`);
        if (!searchRes.ok) {
            ctx.body = { code: 104, msg: 'Open Library服务异常' };
            return;
        }

        const searchData = await searchRes.json();
        const book = searchData.docs?.[0];
        if (!book) {
            ctx.body = { code: 103, msg: '未查询到书籍' };
            return;
        }

        let summary = '';
        if (book.key) {
            const detailRes = await fetch(`${openLibraryURL}${book.key}.json`);
            if (detailRes.ok) {
                const detail = await detailRes.json();
                summary = typeof detail.description === 'string'
                    ? detail.description
                    : detail.description?.value || '';
            }
        }

        ctx.body = {
            code: 0,
            data: {
                isbn,
                title: book.title || '',
                author: book.author_name?.join(', ') || '',
                image: book.cover_i
                    ? `${openLibraryCoverURL}/b/id/${book.cover_i}-L.jpg`
                    : '',
                summary
            }
        };
    }
    catch (error) {
        ctx.body = { code: 104, msg: 'ISBN服务请求失败' };
    }
};
export { export$0 as export };
export { delete$0 as delete };
