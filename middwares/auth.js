exports.isLogin = async (ctx, next) => {
    if(!ctx.session.user) {
        return ctx.body = {code:403,msg:'未登录'};
    }
    await next();
}

exports.isAdmin = async (ctx, next) => {
    if(ctx.session?.user?.role > 10) {
        await next();
    }else{
        ctx.body = {code:100000,msg:'你不是管理员！'};
    }
}