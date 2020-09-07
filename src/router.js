const lodash = require('lodash');
const KoaRouter = require('koa-router');

function composeFlow([flow = () => undefined, ...restFlow]) {
  const nextFlow = restFlow.length ? composeFlow(restFlow) : v => v;

  return async function (arg) {
    let callNext = true;

    const next = (options) => {
      callNext = false;
      return nextFlow.call(this, options);
    };

    const end = (data) => {
      callNext = false;
      return data;
    };

    let ret = await flow.call(this, arg, next, end);
    if (callNext) {
      ret = await nextFlow.call(this, ret);
    }
    return ret;
  };
}

/**
 * Router
 */
class Router extends KoaRouter {
  constructor(...args) {
    super(...args);
    this.pathTable = {};

    // methods name from "this.methods", list them for IDEA friendly
    this.all = this._asFlow('all');
    this.head = this._asFlow('head');
    this.options = this._asFlow('options');
    this.get = this._asFlow('get');
    this.put = this._asFlow('put');
    this.patch = this._asFlow('patch');
    this.post = this._asFlow('post');
    this.delete = this._asFlow('delete');
  }

  _asFlow(method) {
    return (path, ...flowArray) => {
      lodash.set(this.pathTable, [path, method], flowArray);

      const flow = composeFlow(flowArray);
      const middleware = async (ctx) => {
        const ret = await flow.call(ctx, ctx);
        if (ret !== undefined) {
          ctx.body = ret;
        }
      };

      this.register(path, [method], [middleware]);
    };
  }

  sub(path, router) {
    if (!(typeof path === 'string')) {
      throw new Error(`path "${path}" not string`);
    }
    if (!(router instanceof KoaRouter)) {
      throw new Error(`${router} not instanceof koa-router`);
    }

    lodash.set(this.pathTable, [path, 'sub'], router);
    this.use(path, router.routes(), router.allowedMethods());
  }
}

module.exports = Router;
