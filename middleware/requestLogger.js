function requestLogger(logger, { space = 0, request = {}, response = {} } = {}) {
  return async function(ctx, next) {
    const startTime = Date.now();

    try {
      await next();
    } finally {
      const requestObject = {
        http: ctx.req.httpVersion,
        method: ctx.request.method,
        url: ctx.request.url,
        params: ctx.params,
        query: ctx.request.query,
        header: ctx.request.header,
        body: ctx.request.body,
      };

      const responseObject = {
        length: ctx.response.length,
        status: ctx.response.status,
        message: ctx.response.message,
        header: ctx.response.header,
        body: ctx.response.body,
      };

      logger.info(
        JSON.stringify({
          request: { ...requestObject, ...request },
          response: { ...responseObject, ...response },
          duration: Date.now() - startTime,
        }, null, space),
      );
    }
  };
}

module.exports = requestLogger;
