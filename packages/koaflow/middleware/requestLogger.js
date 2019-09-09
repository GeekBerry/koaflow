function pickByList(list, obj) {
  if (!list) {
    return obj;
  }

  const ret = {};
  for (const key of list) {
    ret[key] = obj[key];
  }
  return ret;
}

function requestLogger(logger, { space, request, response, timestamp } = {}) {
  return async function(ctx, next) {
    const startTime = Date.now();

    try {
      await next();
    } finally {
      logger.info(
        JSON.stringify({
          request: pickByList(request, {
            http: ctx.req.httpVersion,
            method: ctx.request.method,
            url: ctx.request.url,
            params: ctx.params,
            query: ctx.request.query,
            header: ctx.request.header,
            body: ctx.request.body,
          }),

          response: pickByList(response, {
            length: ctx.response.length,
            status: ctx.response.status,
            message: ctx.response.message,
            header: ctx.response.header,
            body: ctx.response.body,
          }),

          timestamp: timestamp === false ? undefined : startTime,
          duration: Date.now() - startTime,
        }, null, space),
      );
    }
  };
}

module.exports = requestLogger;
