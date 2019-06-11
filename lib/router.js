const KoaRouter = require('koa-router');

/**
 * AppRouter
 */
class AppRouter extends KoaRouter {
  constructor(...args) {
    super(...args);
    this.all = this.wrap(super.all);

    this.head = this.wrap(super.head); // 类似于get请求，只不过返回的响应中没有具体的内容，用于获取报头
    this.connect = this.wrap(super.connect); // HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器
    this.trace = this.wrap(super.trace); // 允许客户端查看服务器的性能
    this.options = this.wrap(super.options); // 回显服务器收到的请求，主要用于测试或诊断

    this.get = this.wrap(super.get); // 从服务器取出资源（一项或多项）
    this.post = this.wrap(super.post); // 在服务器新建一个资源
    this.put = this.wrap(super.put); // 在服务器更新资源（客户端提供改变后的完整资源）
    this.patch = this.wrap(super.patch); // 在服务器更新资源（客户端提供改变的属性）
    this.del = this.wrap(super.del); // 从服务器删除资源
  }

  subRouter(path, router) {
    if (!(router instanceof KoaRouter)) {
      throw new Error(`${router} not instanceof koa-router`);
    }
    this.use(path, router.routes(), router.allowedMethods());
  }

  /**
   * 将解析方法中间件变成链式形式
   * @private
   * @param method
   * @return {function(*=, ...[*]): *}
   */
  wrap(method) {
    const self = this;

    return function (path, ...functions) {
      const middlewares = functions.map(
        func => async function (ctx, next) {
          const options = ctx.body === undefined ? ctx : ctx.body;
          const result = await func.call(ctx, options);
          ctx.body = result === undefined ? ctx.body : result;
          await next();
        },
      );

      return method.bind(self)(path, ...middlewares);
    };
  }
}

module.exports = AppRouter;
