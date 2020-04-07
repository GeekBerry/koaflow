const lodash = require('lodash');
const Entry = require('./Entry');

class ParameterError extends Error {}

function parameter(options) {
  const keyToEntry = {};
  lodash.forEach(options, (schema, key) => {
    keyToEntry[key] = new Entry(key, schema);
  });

  return (object) => {
    const result = {};
    for (const [key, entry] of Object.entries(keyToEntry)) {
      try {
        const value = entry.pick(object, result);
        if (value !== undefined) {
          lodash.set(result, key, value);
        }
      } catch (e) {
        throw new ParameterError(e.message);
      }
    }
    return result;
  };
}

module.exports = parameter;
module.exports.ParameterError = ParameterError;
