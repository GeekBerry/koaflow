class LogicError extends Error {
  static extend({ name, ...options } = {}) {
    class ExtendError extends this {
      static get name() {
        return name || super.name;
      }

      constructor(arg) {
        super(arg);
        Object.assign(this, options);
      }
    }

    Object.assign(ExtendError, options);
    return ExtendError;
  }

  constructor(arg) {
    super();
    this.name = this.constructor.name;

    if (arg instanceof Error) {
      this.code = arg.code;
      this.message = arg.message;
      this.stack = arg.stack; // 复制调用栈, (stack 不会被设为 Object.keys)
    } else if (typeof arg === 'string') {
      this.message = arg;
    }
  }
}

module.exports = LogicError;
