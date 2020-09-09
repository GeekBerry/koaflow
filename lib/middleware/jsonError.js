async function jsonError(ctx, next) {
  try {
    await next();

    if (ctx.body !== undefined) {
      ctx.body = { code: 0, message: '', result: ctx.body };
      ctx.static = 200;
    } // else status => 404
  } catch (e) {
    ctx.body = { code: e.code, message: e.message };
  }
}

module.exports = jsonError;
