const lodash = require('lodash');

class ParserError extends Error {
  constructor(message, options = {}) {
    super();
    this.copy({ message, ...options });
  }

  copy(other) {
    this.message = other.message;
    Object.assign(this, other);
    return this;
  }
}

// ----------------------------------------------------------------------------
function Parser(parser) {
  parser.constructor = Parser;
  parser.$before = $before;
  parser.$parse = $parse;
  parser.$default = $default;
  parser.$after = $after;
  parser.$validate = $validate;
  parser.$or = $or;
  return parser;
}

function $before(func) {
  return Parser((arg, path, origin) => this(func(arg), path, origin));
}

function $default(data) {
  return $before.call(this, value => (value === undefined ? data : value));
}

function $parse(func, condition = lodash.isString) {
  return $before.call(this, value => (condition(value) ? func(value) : value));
}

function $after(func) {
  return Parser((arg, ...args) => func(this(arg), ...args));
}

function $validate(func, name) {
  const parser = $after.call(this, value => {
    if (!func(value)) {
      throw new Error(`${value} do not match "${name || func.name || parser.$name || '$validate'}"`);
    }
    return value;
  });
  return parser;
}

function $or(schema) {
  const other = Parser.from(schema);

  return Parser((value, path = [], origin = value) => {
    const errorArray = [];
    for (const func of [this, other]) {
      try {
        return func(value, path, origin);
      } catch (e) {
        errorArray.push(e);
      }
    }

    const or = errorArray.map(e => (e.or ? e.or : e));
    const message = lodash.flattenDeep(or).map(e => `(${e.message})`).join(' or ');
    throw new ParserError(`path="${path.join('.')}", not match any ${message}`, { origin, path, value, or });
  });
}

// ----------------------------------------------------------------------------
Parser.fromArray = function (schema, options) {
  const func = schema.length ? Parser.from(schema[0], options) : v => v;
  return (value, path = [], origin = value) => {
    if (!Array.isArray(value)) {
      throw new ParserError(`path="${path.join('.')}", expected array, got ${typeof value}`, { origin, path, value });
    }

    const error = new ParserError(); // create Error here for shallow stack
    return value.map((v, i) => {
      try {
        return func(v, [...path, i], origin);
      } catch (e) {
        throw error.copy(e);
      }
    });
  };
};

Parser.fromObject = function (schema, options) {
  const { skip, pick } = options;

  const keyToFunc = lodash.mapValues(schema, s => Parser.from(s, options));

  return (value, path = [], origin = value) => {
    if (!lodash.isObject(value)) {
      throw new ParserError(`path="${path.join('.')}", expected plain object, got ${typeof value}`, { origin, path, value });
    }

    const error = new ParserError(); // create Error here for shallow stack
    const result = lodash.mapValues(keyToFunc, (func, k) => {
      const v = lodash.get(value, k);
      if (v === undefined && skip) {
        return undefined;
      }

      try {
        return func(v, [...path, k], origin);
      } catch (e) {
        throw error.copy(e);
      }
    });

    return pick ? lodash.pickBy(result, v => v !== undefined) : { ...value, ...result };
  };
};

Parser.fromFunction = function (func) {
  if (func.constructor === Parser) {
    return func;
  }

  return (value, path = [], origin = value) => {
    try {
      return func(value);
    } catch (e) {
      throw new ParserError(`path="${path.join('.')}", ${e.message}`, { origin, path, value });
    }
  };
};

Parser.fromValue = function (schema) {
  return (value, path = [], origin = value) => {
    if (value !== schema) {
      throw new ParserError(`path="${path.join('.')}", expected to be ${schema}, got ${value}`, { origin, path, value });
    }
    return value;
  };
};

Parser.from = function (schema, options = {}) {
  let func;
  if (Array.isArray(schema)) {
    func = Parser.fromArray(schema, options);
  } else if (lodash.isPlainObject(schema)) {
    func = Parser.fromObject(schema, options);
  } else if (lodash.isFunction(schema)) {
    func = Parser.fromFunction(schema);
  } else {
    func = Parser.fromValue(schema);
  }
  return Parser(func);
};

module.exports = Parser.from;
