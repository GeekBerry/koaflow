function errorFormat({
  message,
  name, status, statusCode, expose, stack,
  ...options
} = {}) {
  return { message, ...options };
}

module.exports = errorFormat;
