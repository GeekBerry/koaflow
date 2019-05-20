function Logger(callback) {
  return async function (ctx, next) {
    const startTime = Date.now();
    try {
      await next();
    } finally {
      await callback({
        http: ctx.req.httpVersion,
        method: ctx.req.method,
        url: ctx.req.url,
        headers: ctx.req.headers,
        status: ctx.status || 400,
        length: ctx.length || 0,
        duration: Date.now() - startTime,
      });
    }
  };
}

module.exports = Logger;
