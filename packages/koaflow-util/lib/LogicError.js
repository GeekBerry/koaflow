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

module.exports = LogicError;
