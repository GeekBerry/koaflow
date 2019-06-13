const Koa = require('koa');
const koaBodyParser = require('koa-bodyparser');
const koaJsonError = require('koa-json-error');

const objectLogger = require('./logger');
const errorFormat = require('./error');
const assignContext = require('./ctx');
const AppRouter = require('./router');

/**
 * App
 */
class App extends Koa {
  constructor({
    ioLogger,
    jsonError = errorFormat,
    bodyParser = { enableTypes: ['json', 'form', 'text'] },
  } = {}) {
    super();
    this._httpServer = null;
    this.router = new AppRouter();
    this.ctx = {};

    if (ioLogger) {
      this.use(objectLogger(ioLogger));
    }
    this.use(koaJsonError(jsonError));
    this.use(koaBodyParser(bodyParser));
  }

  listen(...args) {
    if (!this._httpServer) {
      this.use(assignContext(this.ctx));
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
module.exports.Router = AppRouter;
