const lodash = require('lodash');
const KoaRouter = require('koa-router');
const flow = require('./flow');

/**
 * Router
 */
class Router extends KoaRouter {
  _wrapAsFlow(method) {
    return (path, ...functions) => {
      method.call(this, path, async (ctx) => {
        const ret = await flow(...functions)(ctx);
        if (ret !== undefined) {
          ctx.body = ret;
        }
      });
    };
  }

  constructor(...args) {
    super(...args);

    // methods name from "this.methods", list them for IDEA friendly
    this.all = this._wrapAsFlow(this.all);
    this.head = this._wrapAsFlow(this.head);
    this.options = this._wrapAsFlow(this.options);
    this.get = this._wrapAsFlow(this.get);
    this.post = this._wrapAsFlow(this.post);
    this.put = this._wrapAsFlow(this.put);
    this.patch = this._wrapAsFlow(this.patch);
    this.delete = this._wrapAsFlow(this.delete);
  }

  sub(path, router) {
    if (!lodash.isString(path)) {
      throw new Error(`path "${path}" not string`);
    }
    if (!(router instanceof KoaRouter)) {
      throw new Error(`${router} not instanceof koa-router`);
    }
    super.use(path, router.routes(), router.allowedMethods());
  }
}

module.exports = Router;
