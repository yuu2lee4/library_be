import Tag from "../models/tag.js";

export const save = async (ctx) => {
    const id = ctx.request.body._id;
    if (id) {
        const tag = await Tag.findById(id);
        Object.assign(tag, ctx.request.body);
        await tag.save();
        ctx.body = { code: 0, data: true };
    }
    else {
        const name = ctx.request.body.name;
        const tag = await Tag.findOne({ name: name }).exec();
        if (tag) {
            ctx.body = { code: 100, msg: '已存在相同的Tag！' };
        }
        else {
            const newtag = await Tag.create(ctx.request.body);
            if (newtag) {
                ctx.body = { code: 0, data: true };
            }
        }
    }
};
export const get = async (ctx) => {
    const id = ctx.params.id;
    const tag = await Tag.findOne({ _id: id }).exec();
    if (tag) {
        ctx.body = { code: 0, data: tag };
    }
};
export const list = async (ctx) => {
    let tag;
    if (ctx.query.ids) {
        const ids = ctx.query.ids.split(',');
        tag = await Tag.find({ _id: { $in: ids } }).exec();
    } else {
        tag = await Tag.find().exec();
    }
    if (tag) {
        ctx.body = { code: 0, data: tag };
    }
};
export const search = async (ctx) => {
    const pageSize = ctx.query.pageSize * 1 || 10;
    const page = ctx.query.page * 1 || 1;
    const skipNum = (page - 1) * pageSize;
    let searchTagPromise = Tag.find().limit(pageSize).skip(skipNum).exec();
    let countNumerPromise = Tag.count();
    const tags = await searchTagPromise;
    const total = await countNumerPromise;
    if (tags.length) {
        ctx.body = {
            code: 0,
            data: {
                results: tags,
                page,
                pageSize,
                total
            }
        };
    }
    else {
        ctx.body = { code: 101, msg: '未查询到分类!' };
    }
};
export const deleteOne = async (ctx) => {
    const id = ctx.params.id;
    await Tag.deleteOne({ _id: id }).exec();
    ctx.body = { code: 0, data: true };
};
const delete$0 = async (ctx) => {
    const ids = ctx.query.ids.split(',');
    await Tag.deleteMany({ _id: { $in: ids } }).exec();
    ctx.body = { code: 0, data: true };
};
export { delete$0 as delete };
