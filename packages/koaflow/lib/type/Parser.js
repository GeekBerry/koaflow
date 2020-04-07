const lodash = require('lodash');

function callable(object, func) {
  return new Proxy(func, {
    getPrototypeOf: () => Object.getPrototypeOf(object),
    getOwnPropertyDescriptor: (_, key) => Object.getOwnPropertyDescriptor(object, key),
    ownKeys: () => Reflect.ownKeys(object),
    has: (_, key) => Reflect.has(object, key),
    get: (_, key) => Reflect.get(object, key),
    set: (_, key, value) => Reflect.set(object, key, value),
    deleteProperty: (_, key) => Reflect.deleteProperty(object, key),
  });
}

class Parser {
  constructor(...args) {
    this.name = this.constructor.name;
    this.args = args;
    return callable(this, (...args) => this.__call__(...args));
  }

  __call__(data) {
    const origin = data;
    for (const { operate, value, validator, parser, condition, array } of this.args) {
      switch (operate) {
        case 'default':
          if (data === undefined) {
            data = value;
          }
          break;

        case 'parse':
          try {
            if (condition(data)) {
              data = parser(data);
            }
          } catch (e) {
            throw new Error(`parse to "${this.name}" failed\ndata: ${data}, origin: ${origin}`);
          }
          break;

        case 'validate':
          try {
            if (!(validator(data))) {
              throw new Error('ValidatorError');
            }
          } catch (e) {
            throw new Error(`do not match "${validator.name}"\ndata: ${data}\norigin: ${origin}`);
          }
          break;

        case 'any':
          const errors = [];
          for (const parser of array) {
            try {
              data = parser(data);
            } catch (e) {
              errors.push(e);
            }
          }
          if (errors.length === array.length) {
            throw new Error(`do not match "${array.map(v => v.name).join('|')}"\ndata: ${data}\norigin: ${origin}`);
          }
          break;

        default:
          throw new Error(`unexpected operate "${operate}"`);
      }
    }
    return data;
  }

  $named(name) {
    const parser = new this.constructor(...this.args);
    parser.name = name;
    return parser;
  }

  $default(value) {
    return new this.constructor({ operate: 'default', value }, ...this.args);
  }

  $parse(parser, condition = lodash.isString) {
    return new this.constructor({ operate: 'parse', parser, condition }, ...this.args);
  }

  $validate(validator) {
    return new this.constructor({ operate: 'validate', validator }, ...this.args);
  }

  $any(...array) {
    if (array.length === 0) {
      throw new Error('array can not be empty');
    }
    return new this.constructor({ operate: 'any', array }, ...this.args);
  }
}

module.exports = Parser;
