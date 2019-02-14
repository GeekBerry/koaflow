/**
 * AppError
 */
class AppError extends Error {
  constructor(message, status = 500, options = {}) {
    super(message);
    this.status = status;

    for (const [k, v] of Object.entries(options)) {
      this[k] = v;
    }
  }

  static async handle(ctx, next) {
    try {
      await next();
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError('Internal Logic Error');
      ctx.status = err.status;
      ctx.body = JSON.stringify(e.message); // 必须覆盖 body, 必须设置为JSON
    }
  }
}

module.exports = AppError;
