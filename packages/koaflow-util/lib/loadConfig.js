const path = require('path');

function loadConfig(dir, env = '') {
  function load(name) {
    try {
      return require(path.resolve(dir, name));
    } catch (e) {
      return {};
    }
  }

  return Object.assign({}, load(''), load(env), load('local'));
}

module.exports = loadConfig;
