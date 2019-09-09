class AppError extends Error {
  static extend(name, options = {}) {
    const SubError = class extends this {
      static get name() {
        return name;
      }

      constructor(message) {
        super(message || name);
      }
    };

    Object.assign(SubError, options);
    return SubError;
  }

  constructor(message) {
    super();
    Object.assign(this, this.constructor);
    this.message = message;
  }
}

module.exports = AppError;
