const KoaRouter = require('koa-router');
const flow = require('./flow');

/**
 * AppRouter
 */
class AppRouter extends KoaRouter {
  _wrapAsFlow(method) {
    return (path, ...functions) => {
      function middleware(ctx, next) {
        // set last (!undefined) return value to body
        const bindFlow = flow(...functions, ret => {ctx.body = ret;});
        return bindFlow(ctx, next);
      }

      method.call(this, path, middleware);
    };
  }

  constructor(...args) {
    super(...args);

    // methods name from "this.methods", list them for IDEA friendly
    this.allFlow = this._wrapAsFlow(this.all);
    this.headFlow = this._wrapAsFlow(this.head);
    this.optionsFlow = this._wrapAsFlow(this.options);
    this.getFlow = this._wrapAsFlow(this.get);
    this.postFlow = this._wrapAsFlow(this.post);
    this.putFlow = this._wrapAsFlow(this.put);
    this.patchFlow = this._wrapAsFlow(this.patch);
    this.deleteFlow = this._wrapAsFlow(this.delete);
  }

  subRouter(path, router) {
    if (!(router instanceof KoaRouter)) {
      throw new Error(`${router} not instanceof koa-router`);
    }
    super.use(path, router.routes(), router.allowedMethods());
  }
}

module.exports = AppRouter;
