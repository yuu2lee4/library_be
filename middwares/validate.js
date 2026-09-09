export const validate = schemas => async (ctx, next) => {
    const sources = {
        body: schemas.body?.safeParse(ctx.request.body),
        query: schemas.query?.safeParse(ctx.query),
        params: schemas.params?.safeParse(ctx.params)
    };

    const errors = Object.entries(sources).flatMap(([source, result]) => {
        if (!result || result.success) return [];

        return result.error.issues.map(issue => ({
            source,
            path: issue.path,
            message: issue.message
        }));
    });

    if (errors.length) {
        ctx.status = 400;
        ctx.body = {
            code: 400,
            msg: '请求参数错误',
            errors
        };
        return;
    }

    ctx.state.input = Object.fromEntries(
        Object.entries(sources)
            .filter(([, result]) => result)
            .map(([source, result]) => [source, result.data])
    );

    await next();
};