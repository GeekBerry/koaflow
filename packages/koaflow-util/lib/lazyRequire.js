const path = require('path');

function lazyRequire(dir) {
  return (...args) => {
    return new Proxy({}, {
      get(self, key) {
        if (!(key in self)) {
          const func = require(path.resolve(dir, key));
          self[key] = func(...args);
        }
        return self[key];
      },
    });
  };
}

module.exports = lazyRequire;
