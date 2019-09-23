const lodash = require('lodash');

function pick(ctx, keyToPath, keyToDefaultPath = {}) {
  const info = {};

  lodash.forEach(keyToPath, (path, key) => {
    if (path === true) {
      path = keyToDefaultPath[key];
    }

    let value = undefined;
    if (typeof path === 'string') {
      value = lodash.get(ctx, path);
    } else if (lodash.isFunction(path)) {
      value = path(ctx);
    }

    lodash.set(info, key, value);
  });

  return info;
}

function requestLogger({
  logger = console,
  request = { timestamp: true, method: true, url: true },
  response = { status: true, length: true, duration: true },
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

  return async function (ctx, next) {
    const timestamp = Date.now();

    try {
      await next();
    } finally {
      if (logger) {
        const info = {};

        info.request = pick(ctx, request, {
          timestamp: () => timestamp,
          http: 'req.httpVersion',
          method: 'request.method',
          url: 'request.url',
          params: 'params',
          query: 'request.query',
          header: 'request.header',
          body: 'request.body',
        });

        info.response = pick(ctx, response, {
          duration: () => Date.now() - timestamp,
          length: 'response.length',
          status: 'response.status',
          message: 'response.message',
          header: 'response.header',
          body: 'response.body',
        });

        logger[level](format(info));
      }
    }
  };
}

module.exports = requestLogger;
