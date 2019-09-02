const AppError = require('../lib/error');

function jsonError() {
  return async function(ctx, next) {
    try {
      await next();
    } catch (e) {
      if (!(e instanceof AppError)) {
        throw new AppError('AppError');
      }
      ctx.body = e;
    }
  };
}

module.exports = jsonError;
