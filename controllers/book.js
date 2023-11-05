const Book = require('../models/book')
const fs = require('fs/promises')
const xlsx = require('node-xlsx').default
const format = require('date-fns/format')
const path =  require('path')
const config = require('config');

//save book
exports.save = async ctx=>{
    const id = ctx.request.body._id
    if(id){
        const book = await Book.findById(id);
        Object.assign(book, ctx.request.body)
        await book.save();
        ctx.body = {code:0,data: true}
    }else{
        const isbn = ctx.request.body.isbn;
        const book = await Book.findOne({isbn: isbn}).exec();
        if(book){
            ctx.body = {code:100,msg:'该书籍已存在！'}
        }else{
            const newBook = await Book.create(ctx.request.body)
            if(newBook){
                ctx.body = {code:0,data: true}
            }
        }
    }
}
//get one book
exports.get = async ctx=>{
    const id = ctx.params.id
    const book = await Book.findOne({_id: id}).exec();
    if(book){
        ctx.body = {code:0,data: book}
    }
}
//book list
exports.list = async ctx=>{
    let book;
    if(ctx.query.ids){
        const ids = ctx.query.ids.split(',');
        book = await Book.find({_id: {$in: ids} }).exec();
    }else{
        book = await Book.find().exec();
    }
    if(book){
        ctx.body = {code:0,data: book}
    }
}
//book search
exports.search = async ctx=>{
    const pageSize = ctx.query.pageSize*1 || 10
    const page = ctx.query.page * 1 || 1
    const skipNum = (page-1) * pageSize

    let searchBookPromise = Book.find({title: new RegExp(ctx.query.title, 'i')}).limit(pageSize).skip(skipNum).exec();
    let countNumerPromise = Book.count({title: new RegExp(ctx.query.title, 'i')});
    const books = await searchBookPromise;
    const total = await countNumerPromise;

    if(books.length){
        ctx.body = {
            code:0,
            data: {
                results: books,
                page,
                pageSize,
                total
            }
        }
    }else{
        ctx.body = {code:101,msg:'未查询到书籍!'}
    }
}
//book get borrowed books
exports.getBorrowedBooks = async ctx=>{
    const pageSize = ctx.query.pageSize*1 || 10
    const page = ctx.query.page * 1 || 1
    const skipNum = (page-1) * pageSize

    let searchBookPromise = Book.find({borrowers: {$not: {$size: 0}}}).limit(pageSize).skip(skipNum).exec();
    let countNumerPromise = Book.count({borrowers: {$not: {$size: 0}}});
    const books = await searchBookPromise;
    const total = await countNumerPromise;

    if(books.length){
        ctx.body = {
            code:0,
            data: {
                results: books,
                page,
                pageSize,
                total
            }
        }
    }else{
        ctx.body = {code:102,msg:'没有借出的书籍!'}
    }
}
//book export all borrowed books to a excel
exports.export = async ctx=>{
    let books;
    if(ctx.query.ids){
        const ids = ctx.query.ids.split(',');
        books = await Book.find({_id: {$in: ids} }).exec();
    }else{
        books = await Book.find({borrowers: {$not: {$size: 0}}}).exec();
    }
    if(books){
        const exportData = [[
            'id',
            '书名',
            'ISBN',
            '作者',
            '借书人',
            '书籍编号',
            '借出时间'
        ]];
        for(const book of books) {
            for(const borrower of book.borrowers) {
                exportData.push([
                    book._id,
                    book.title,
                    book.isbn,
                    book.author,
                    borrower.name,
                    borrower.identifier,
                    borrower.date
                ])
            }
        }
        const buffer = xlsx.build([{name: "借出列表", data: exportData}]);
        const filename = `借书人列表-${format(new Date(),'yyyy-MM-ddTHH-mm-ss')}.xlsx`;
        await fs.writeFile(path.resolve('upload', filename),buffer);
        const { url, port } = config.get('server');
        ctx.body = {code:0,data: `${url}:${port}/${filename}`};
    }
}
//book deleteOne
exports.deleteOne = async ctx=>{
    const id = ctx.params.id
    await Book.deleteOne({_id: id}).exec();
    ctx.body = {code:0,data: true}
}
//book delete
exports.delete = async ctx=>{
    const ids = ctx.query.ids.split();
    await Book.deleteMany({_id: {$in: ids} }).exec();
    ctx.body = {code:0,data: true}
}
//get one book
exports.getByISBN = async ctx=>{
    const isbn = ctx.params.isbn;
    const res = await fetch(`${config.get('isbn.api')}/${isbn}?apikey=${config.get('isbn.apikey')}`);
    if (res.ok) {
        const data = await res.json();
        if (data.ret === 0) {
            ctx.body = { code:0, data: data.data }
        } else {
            ctx.body = { code: 103, msg: data.msg || '未知错误' }
        }
    } else {
        ctx.body = { code: 104, msg: res.statusText || '未知错误' }
    }
}