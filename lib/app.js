const Koa = require('koa');
const KoaBodyParser = require('koa-bodyparser');

const AppError = require('./error');
const AppRouter = require('./router');

/**
 * App
 */
class App extends Koa {
  constructor(...args) {
    super(...args);
    this.server = null;
    this.root = new AppRouter();
    this.use(AppError.handle);
    this.use(KoaBodyParser({ enableTypes: ['json', 'form', 'text'] }));
  }

  listen(...args) {
    if (!this.server) {
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
module.exports.Error = AppError;
