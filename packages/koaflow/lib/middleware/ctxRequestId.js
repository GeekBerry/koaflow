const lodash = require('lodash');

async function ctxRequestId(ctx, next) {
  ctx.requestId = `${Date.now()}${lodash.random(100000, 999999)}`;
  ctx.set('requestId', ctx.requestId); // header.requestId = ctx.requestId
  await next();
}

module.exports = ctxRequestId;
