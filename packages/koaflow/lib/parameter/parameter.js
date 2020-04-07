const lodash = require('lodash');
const callable = require('../util/callable');
const Entry = require('./Entry');

class Parameter {
  constructor(options) {
    this.keyToEntry = {};
    lodash.forEach(options, (schema, key) => {
      this.keyToEntry[key] = new Entry(key, schema);
    });

    return callable(this, this.__call__.bind(this));
  }

  __call__(object) {
    const result = {};
    lodash.forEach(this.keyToEntry, (entry, key) => {
      const value = entry.pick(object, result);
      if (value !== undefined) {
        lodash.set(result, key, value);
      }
    });
    return result;
  }
}

module.exports = callable.withoutNew(Parameter);
