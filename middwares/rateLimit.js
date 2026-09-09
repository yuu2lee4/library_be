const windows = new Map();

export const createRateLimiter = ({ limit = 30, windowMs = 60_000 } = {}) => async (ctx, next) => {
    const key = ctx.session?.user?._id?.toString() || ctx.ip;
    const now = Date.now();
    const current = windows.get(key) || [];
    const recent = current.filter(timestamp => timestamp > now - windowMs);

    if (recent.length >= limit) {
        const retryAfter = Math.ceil((recent[0] + windowMs - now) / 1000);
        ctx.set('Retry-After', String(retryAfter));
        ctx.status = 429;
        ctx.body = { code: 429, msg: '请求过于频繁，请稍后再试' };
        return;
    }

    recent.push(now);
    windows.set(key, recent);
    await next();
};