const path = require('path');

function loadConfig(dir = '.', env) {
  function load(name) {
    try {
      return require(path.resolve(dir, name));
    } catch (e) {
      return {};
    }
  }

  env = env || (process.env.NODE_ENV || 'dev').toLowerCase();
  return Object.assign({}, load(''), load(env));
}

module.exports = loadConfig;
