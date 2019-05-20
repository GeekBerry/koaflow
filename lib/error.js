/**
 * AppError
 */
class AppError extends Error {
  constructor(body, status = 500) {
    super();
    this.status = status;
    this.body = body;
  }

  static async handle(ctx, next) {
    try {
      await next();
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError(e.message); // 当心错误泄漏信息

      ctx.body = err.body;
      ctx.status = err.status;
    }
  }
}

module.exports = AppError;
