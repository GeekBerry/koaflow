const Koa = require('koa');
const koaBodyParser = require('koa-bodyparser');
const Router = require('./router');

/**
 * Koaflow
 */
class Koaflow extends Koa {
  constructor(options) {
    super(options);
    this._httpServer = null;

    this.router = new Router();

    this.use(koaBodyParser({ enableTypes: ['json', 'form', 'text'] }));
  }

  use(func, { prepend = false } = {}) {
    super.use(func);
    if (prepend) {
      func = this.middleware.pop();
      this.middleware = [func, ...this.middleware];
    }
    return this;
  }

  listen(...args) {
    if (!this._httpServer) {
      this.use(this.router.routes());
      this.use(this.router.allowedMethods());
      this._httpServer = super.listen(...args);
    }
    return this._httpServer;
  }

  close() {
    if (this._httpServer) {
      this._httpServer.close();
      this._httpServer = null;
    }
  }
}

module.exports = Koaflow;
