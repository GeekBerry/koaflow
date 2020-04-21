const lodash = require('lodash');

function parse(schema) {
  if (Array.isArray(schema)) {
    return parseArray(schema);
  } else if (lodash.isPlainObject(schema)) {
    return parseObject(schema);
  } else if (lodash.isFunction(schema)) {
    return parserFunction(schema);
  } else {
    throw new Error(`unexpect schema type, got ${schema}`);
  }
}

function parseArray(schema) {
  if (!Array.isArray(schema) || schema.length !== 1) {
    throw new Error(`schema must be array and length equal 1, got ${schema}`);
  }

  const func = parse(schema[0]);
  return array => array.map(func);
}

function parseObject(schema) {
  const keyToFunc = lodash.mapValues(schema, parse);

  return object => {
    lodash.forEach(keyToFunc, (func, key) => {
      object[key] = func(object[key]);
    });
    return object;
  };
}

function parserFunction(func) {
  return value => {
    if (value !== undefined) {
      return func(value);
    }
    return undefined;
  };
}

module.exports = parse;
