const lodash = require('lodash');

function assert(data, template, { err = null, path = '' } = {}) {
  if (arguments.length <= 1) {
    template = v => v;
  }

  err = err || new Error(JSON.stringify(data, null, 2));

  if (lodash.isFunction(template)) {
    if (!template(data)) {
      err.message = `"${path}"\nFunction:${template}\nData:${data}\n`;
      throw err;
    }
  } else if (Array.isArray(template)) {
    template.forEach((v, i) => {
      assert(lodash.get(data, i), v, { path: `${path}[${i}]`, err });
    });
  } else if (lodash.isObject(template)) {
    lodash.forEach(template, (v, k) => {
      assert(lodash.get(data, k), v, { path: `${path}.${k}`, err });
    });
  } else {
    if (!(template === data)) {
      err.message = `"${path}"\nData:${err.message}\nExpect:${template}\nGot:${data}\n`;
      throw err;
    }
  }
}

assert.dump = (v, t = {}) => {
  console.log(JSON.stringify(v, null, 2)); // eslint-disable-line
  return assert(v, t);
};

module.exports = assert;
