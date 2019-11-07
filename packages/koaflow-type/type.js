const lodash = require('lodash');

class TypeError extends Error {}

class Type extends Function {
  constructor(key = 'type') {
    super();
    this.toString = () => key;
    return new Proxy(this, this.constructor);
  }

  static get TypeError() {
    return TypeError;
  }

  static apply(self, bind, [value]) {
    return value;
  }

  static $parse(parser, condition = lodash.isString) {
    return class extends this {
      static apply(self, bind, [value]) {
        if (condition(value)) {
          try {
            value = parser(value);
          } catch (e) {
            throw new TypeError(` parse to type "${self}" failed, got: ${value}`);
          }
        }

        return super.apply(self, bind, [value]);
      }
    };
  }

  static $extend(checker) {
    return class extends this {
      static apply(self, bind, [value]) {
        value = super.apply(self, bind, [value]);
        if (!checker(value)) {
          throw new TypeError(` do not match type "${self}", got: ${value}`);
        }
        return value;
      }
    };
  }

  static $or(type) {
    return class extends this {
      static apply(self, bind, [value]) {
        try {
          try {
            return super.apply(self, bind, [value]);
          } catch (e) {
            return type(value);
          }
        } catch (e) {
          throw new TypeError(` do not match type "${self}", got: ${value}`);
        }
      }
    };
  }

  static $each(type) {
    return class extends this {
      static apply(self, bind, [value]) {
        value = super.apply(self, bind, [value]);
        lodash.forEach(value, (v, k, o) => {
          try {
            value[k] = type(v, k, o);
          } catch (e) {
            throw new TypeError(`[${k}]${e.message}`);
          }
        });
        return value;
      }
    };
  }

  static $schema(object) {
    const keyToEntry = lodash.mapValues(object, (v, k) => {
      return lodash.isFunction(v) ? new Entry(k, { type: v, required: true }) : new Entry(k, v);
    });

    return class extends this {
      static apply(self, bind, [value]) {
        value = super.apply(self, bind, [value]);

        const ret = {};
        lodash.forEach(keyToEntry, (entry, k) => {
          const v = entry.pick(value, ret);
          if (v !== undefined) {
            lodash.set(ret, k, v);
          }
        });
        return ret;
      }
    };
  }

  get TypeError() {
    return this.constructor.TypeError;
  }

  $parse(parser, condition) {
    return new (this.constructor.$parse(parser, condition))(`${this}.$parse(${parser})`);
  }

  $extend(checker) {
    return new (this.constructor.$extend(checker))(`${this}.$extend(${checker})`);
  }

  $or(type) {
    return new (this.constructor.$or(type))(`${this}|${type}`);
  }

  $each(type) {
    return new (this.constructor.$each(type))(`${this}.$each(${type})`);
  }

  $schema(object) {
    return new (this.constructor.$schema(object))(`${this}.$schema(${object})`);
  }
}

class Entry {
  constructor(key, { path = '', type: _type = v => v, 'default': _default, required = false, ...options }) {
    if (!lodash.every(Object.values(options), lodash.isFunction)) {
      throw new TypeError(` not every value in options keys=[${Object.keys(options)}] are function`);
    }

    this.path = path ? `${path}.${key}` : key;
    this.type = _type;
    this.default = lodash.isFunction(_default) ? _default : () => _default;
    this.required = lodash.isFunction(required) ? required : () => required;
    this.condition = function (value, dist) {
      lodash.forEach(options, (condition, name) => {
        if (!condition(value, dist)) {
          throw new TypeError(` do not match condition ${name}, got: ${value}`);
        }
      });
    };
  }

  pick(src, dist) {
    // 检查已验证过的参数
    let value = lodash.get(dist, this.path);

    // 检查原始参数
    if (value === undefined) {
      value = lodash.get(src, this.path);
    }

    // 检查是否必填
    if (value === undefined && this.required(dist)) {
      throw new TypeError(`${this.path} is required`);
    }

    // 获取默认值
    if (value === undefined) {
      value = this.default(dist);
    }

    // 没有默认值将直接返回
    if (value === undefined) {
      return undefined;
    }

    // 检查格式
    try {
      value = this.type(value);
    } catch (e) {
      throw new TypeError(`${this.path}${e.message}`);
    }

    // 附加检查条件
    try {
      this.condition(value, dist);
    } catch (e) {
      throw new TypeError(`${this.path}${e.message}`);
    }

    return value;
  }
}

module.exports = Type;
