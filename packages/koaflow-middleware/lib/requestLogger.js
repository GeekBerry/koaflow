function pick(obj, list) {
  const ret = {};
  for (const key of list) {
    ret[key] = obj[key];
  }
  return ret;
}

function requestLogger({
  request = ['timestamp', 'method', 'url'],
  response = ['status', 'length', 'duration'],
  level = 'info',
  format = 'json',
} = {}) {
  switch (format) {
    case 'readable':
      format = v => JSON.stringify(v, null, 2);
      break;

    case 'json':
      format = v => JSON.stringify(v);
      break;

    case 'object':
      format = v => v;
      break;

    default: // format should be a function
      break;
  }

  return async function(ctx, next) {
    const {
      app: { logger },
    } = ctx;

    const timestamp = Date.now();
    try {
      await next();
    } finally {
      const info = {
        request: pick({
          timestamp,
          http: ctx.req.httpVersion,
          method: ctx.request.method,
          url: ctx.request.url,
          params: ctx.params,
          query: ctx.request.query,
          header: ctx.request.header,
          body: ctx.request.body,
        }, request),

        response: pick({
          duration: Date.now() - timestamp,
          length: ctx.response.length,
          status: ctx.response.status,
          message: ctx.response.message,
          header: ctx.response.header,
          body: ctx.response.body,
        }, response),
      };

      logger[level](format(info));
    }
  };
}

module.exports = requestLogger;
