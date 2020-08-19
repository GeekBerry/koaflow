const KoaRouter = require('koa-router');

function flow(functions) {
  return async (ctx) => {
    let arg = ctx;
    let ret = undefined;

    for (const func of functions) {
      ret = await func.call(ctx, arg);
      arg = ret;
    }

    return ret;
  };
}

function decorateFlow(method) {
  return function (path, ...functions) {
    method.call(this, path, async ctx => {
      const ret = await flow(functions)(ctx);
      if (ret !== undefined) {
        ctx.body = ret;
      }
    });
  };
}

/**
 * Router
 */
class Router extends KoaRouter {
  constructor(...args) {
    super(...args);

    // methods name from "this.methods", list them for IDEA friendly
    this.all = decorateFlow(this.all);
    this.head = decorateFlow(this.head);
    this.options = decorateFlow(this.options);
    this.get = decorateFlow(this.get);
    this.post = decorateFlow(this.post);
    this.put = decorateFlow(this.put);
    this.patch = decorateFlow(this.patch);
    this.delete = decorateFlow(this.delete);
  }

  sub(path, router) {
    if (!(typeof path === 'string')) {
      throw new Error(`path "${path}" not string`);
    }
    if (!(router instanceof KoaRouter)) {
      throw new Error(`${router} not instanceof koa-router`);
    }
    super.use(path, router.routes(), router.allowedMethods());
  }
}

module.exports = Router;
