const KoaRouter = require('koa-router');

function wrap(method) {
  function flow(path, ...functions) {
    async function middleware(ctx, next) {
      let arg = ctx;
      let ret = undefined;

      for (const func of functions) {
        ret = await func.call(ctx, arg);
        if (ret !== undefined) {
          arg = ret;
        }
      }

      ctx.body = ret;
      await next();
    }

    return method.call(this, path, middleware);
  }

  return flow;
}

/**
 * AppRouter
 */
class AppRouter extends KoaRouter {
  constructor(...args) {
    super(...args);

    this.methods.map(v => v.toLowerCase())
      .concat('all')
      .forEach(method => {
        this[method] = wrap(super[method]).bind(this);
      });
  }

  subRouter(path, router) {
    if (!(router instanceof KoaRouter)) {
      throw new Error(`${router} not instanceof koa-router`);
    }
    super.use(path, router.routes(), router.allowedMethods());
  }
}

module.exports = AppRouter;
