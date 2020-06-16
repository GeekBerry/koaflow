const lodash = require('lodash');
const callable = require('./callable');

class Type {
  constructor(...args) {
    this.name = this.constructor.name;
    this.args = args;
    return callable(this, this.__call__.bind(this));
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
          for (const type of array) {
            try {
              data = type(data);
              break;
            } catch (e) {
              errors.push(e);
            }
          }
          if (errors.length === array.length) { // array will not be empty
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
    const type = new this.constructor(...this.args);
    type.name = name;
    return type;
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

module.exports = Type;
