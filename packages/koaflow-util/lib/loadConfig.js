const path = require('path');

function loadConfig(dir = '.') {
  function load(name) {
    try {
      return require(path.resolve(dir, name));
    } catch (e) {
      return {};
    }
  }

  const env = (process.env.NODE_ENV || '').toLowerCase();
  return Object.assign({}, load(''), load(env), load('local'));
}

module.exports = loadConfig;
