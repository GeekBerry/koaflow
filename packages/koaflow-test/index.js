const lodash = require('lodash');
const supertest = require('supertest');

function extendApp(App) {
  class TestApp extends App {
    mock(path, key, value) {
      this.use((ctx, next) => {
        const obj = lodash.get(ctx, path);
        const v = lodash.isFunction(value) ? (...args) => value.call(obj, ...args) : value;
        lodash.set(ctx, `${path}.${key}`, v);
        return next();
      });
    }

    get supertest() {
      if (!this._supertest) {
        this._supertest = supertest(this._httpServer || this.listen());
      }
      return this._supertest;
    }
  }

  return TestApp;
}

module.exports = extendApp;
