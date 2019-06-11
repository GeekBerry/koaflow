const koaJsonError = require('koa-json-error');

function simpleFormat({
  message,
  name, status, statusCode, expose, stack,
  ...options
} = {}) {
  return { message, ...options };
}

function jsonError(formatError = simpleFormat) {
  return koaJsonError(formatError);
}

module.exports = jsonError;
