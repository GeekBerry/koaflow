/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');

function loadConfig(dir, env = '') {
  function load(name) {
    try {
      return require(path.resolve(dir, name));
    } catch (e) {
      return {};
    }
  }

  return { ...load(''), ...load('local'), ...load(env) };
}

module.exports = loadConfig;
