exports.isAdmin = async (ctx, next) => {
    if(ctx.session.user && ctx.session.user.role > 10) {
        await next();
    }else{
        ctx.body = {code:100000,msg:'你不是管理员！'};
    }
}