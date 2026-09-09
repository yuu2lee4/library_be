export const verifyPin = async (ctx, next) => {
    const { name, pin } = ctx.state.input.body;

    if (!ctx.session.pin) {
        ctx.status = 400;
        ctx.body = { code: 205, msg: '未验证或验证码已过期!' };
        return;
    }

    if (pin.toUpperCase() !== ctx.session.pin.code) {
        ctx.status = 400;
        ctx.body = { code: 207, msg: '验证码错误!' };
        return;
    }

    if (name !== ctx.session.pin.email) {
        ctx.status = 400;
        ctx.body = { code: 208, msg: '验证邮箱错误!' };
        return;
    }

    await next();
};