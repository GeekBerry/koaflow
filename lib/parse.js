const lodash = require('lodash');

/**
 * @param schema {object|array|boolean|function}
 * @param [options] {object}
 * @param [options.pick] {boolean} - Keep schema key only
 * @return {function}
 */
function parse(schema, options) {
  if (Array.isArray(schema)) {
    return parseArray(schema, options);
  } else if (lodash.isPlainObject(schema)) {
    return parseObject(schema, options);
  } else if (lodash.isFunction(schema)) {
    return parserFunction(schema);
  } else if (lodash.isBoolean(schema)) {
    return parseBoolean(schema);
  } else {
    throw new Error(`unexpect schema type, got ${schema}`);
  }
}

function parseArray(schema, options) {
  if (!Array.isArray(schema) || schema.length !== 1) {
    throw new Error(`schema must be array and length equal 1, got ${schema}`);
  }

  const func = parse(schema[0], options);

  return array => {
    if (!Array.isArray(array)) {
      return array;
    }

    return array.map(func);
  };
}

function parseObject(schema, options = {}) {
  const keyToFunc = lodash.mapValues(schema, v => parse(v, options));
  const defaultFunc = parseBoolean(!options.pick);

  return object => {
    if (!lodash.isObject(object)) {
      return object;
    }

    const result = {};
    lodash.forEach(object, (value, key) => {
      const func = keyToFunc[key] || defaultFunc;
      value = func(value);
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  };
}

function parserFunction(func) {
  return value => {
    if (value === undefined) {
      return value;
    }
    return func(value);
  };
}

function parseBoolean(schema) {
  return value => (schema ? value : undefined);
}

module.exports = parse;
