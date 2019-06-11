function objectLogger(logger) {
  return async function (ctx, next) {
    const startTime = Date.now();
    try {
      await next();
    } finally {
      const data = {
        http: ctx.req.httpVersion,
        method: ctx.req.method,
        url: ctx.req.url,
        headers: ctx.req.headers,
        status: ctx.status || 400,
        length: ctx.length || 0,
        duration: Date.now() - startTime,
      };

      if (data.status < 400) {
        await logger.info(data);
      } else {
        await logger.error(data);
      }
    }
  };
}

module.exports = objectLogger;
