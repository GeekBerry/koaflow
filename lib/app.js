const Koa = require('koa');
const koaBodyParser = require('koa-bodyparser');

const objectLogger = require('./logger');
const jsonError = require('./error');
const assignContext = require('./ctx');
const AppRouter = require('./router');

/**
 * App
 */
class App extends Koa {
  constructor({
    ioLogger,
    formatError,
    bodyParser = { enableTypes: ['json', 'form', 'text'] },
  } = {}) {
    super();
    this.root = new AppRouter();
    this.ctx = {};
    this.server = null;

    if (ioLogger) {
      this.use(objectLogger(ioLogger));
    }
    this.use(jsonError(formatError));
    this.use(koaBodyParser(bodyParser));
  }

  listen(...args) {
    if (!this.server) {
      this.use(assignContext(this.ctx));
      this.use(this.root.routes());
      this.use(this.root.allowedMethods());
      this.server = super.listen(...args);
    }
    return this.server;
  }

  close() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

module.exports = App;
module.exports.Router = AppRouter;
