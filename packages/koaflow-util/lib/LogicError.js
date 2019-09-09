class LogicError extends Error {
  static extend(options = {}) {
    class SubError extends this {}

    Object.assign(SubError, options);
    return SubError;
  }

  constructor(arg) {
    super();
    Object.assign(this, this.constructor);

    if (arg instanceof Error) {
      this.message = arg.message;
      this.stack = arg.stack; // 复制调用栈, (stack 不会被设为 Object.keys)
    } else if (typeof arg === 'string') {
      this.message = arg;
    }
  }
}

/**
 * wrap a error to a LogicError subclass instance
 * @param {Function} condition: Error=>boolean
 * @param {object|LogicError} options: option object or LogicError subclass (use as object)
 * @return {Function}: middleware
 */
function wrap(condition, options = {}) {
  const ErrorType = LogicError.extend(options);

  return async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (condition(e)) {
        e = new ErrorType(e);
      }
      throw e;
    }
  };
}

module.exports = LogicError;
module.exports.wrap = wrap;
