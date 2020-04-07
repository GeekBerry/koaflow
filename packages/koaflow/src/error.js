class LogicError extends Error {}

function extend({ name = 'LogicError', ...options } = {}) {
  class ExtendError extends LogicError {
    static get name() {
      return name;
    }

    constructor(arg) {
      super();
      this.name = name;
      Object.assign(this, options);

      if (arg instanceof Error) {
        this.message = arg.message;
        this.stack = arg.stack; // 复制调用栈, (stack 不会被设为 Object.keys)
      } else if (typeof arg === 'string') {
        this.message = arg;
      }
    }
  }

  Object.assign(ExtendError, options);
  return ExtendError;
}

module.exports = LogicError;
module.exports.extend = extend;
