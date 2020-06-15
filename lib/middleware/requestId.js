const lodash = require('lodash');

async function requestId(ctx, next) {
  const date = new Date();
  const match = date.toISOString().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/);

  ctx.requestId = `${match.slice(1, 8).join('')}${lodash.random(100, 999)}`;
  ctx.set('Request-Id', ctx.requestId); // header['Request-Id'] = ctx.requestId
  await next();
}

module.exports = requestId;
