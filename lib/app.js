const Koa = require('koa');
const KoaBodyParser = require('koa-bodyparser');
const KoaLogger = require('koa-logger');

const AppError = require('./error');
const AppRouter = require('./router');

/**
 * App
 */
class App extends Koa {
  constructor(...args) {
    super(...args);
    this.root = new AppRouter();

    this.use(KoaLogger());
    this.use(AppError.handle);
  }

  listen(...args) {
    this.use(KoaBodyParser({ enableTypes: ['json', 'form', 'text'] }));
    this.use(this.root.routes());
    this.use(this.root.allowedMethods());
    return super.listen(...args);
  }
}

module.exports = App;
module.exports.Router = AppRouter;
module.exports.Error = AppError;
