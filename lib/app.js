const Koa = require('koa');
const koaBodyParser = require('koa-bodyparser');
const AppRouter = require('./router');

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

  use(fn, prepend = false) {
    super.use(fn);
    if (prepend) {
      fn = this.middleware.pop();
      this.middleware = [fn, ...this.middleware];
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
