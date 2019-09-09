const AppError = require('../lib/error');

function jsonError(logger) {
  return async function(ctx, next) {
    try {
      await next();
    } catch (e) {
      if (!(e instanceof AppError)) {
        logger.error(e);
        throw new AppError('AppError');
      }
      ctx.body = e;
    }
  };
}

module.exports = jsonError;
