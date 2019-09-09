const Koa = require('koa');
const koaBodyParser = require('koa-bodyparser');
const AppRouter = require('./router');
const flow = require('../middleware/flow');

/**
 * App
 */
class App extends Koa {
  constructor(options) {
    super(options);
    this._httpServer = null;
    this.router = new AppRouter();

    this.use(koaBodyParser({ enableTypes: ['json', 'form', 'text'] }));
  }

  useFlow(...functions) {
    return this.use(flow.call(this, ...functions));
  }

  use(func, prepend = false) {
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

module.exports = App;
