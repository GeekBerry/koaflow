const lodash = require('lodash');

TypeError = class extends Error {};

class Type extends Function {
  constructor(key = 'type') {
    super();
    this.toString = () => key;
    return new Proxy(this, this.constructor);
  }

  static set(self, key, value) {
    if (key in self) {
      throw new TypeError(`already have type named "${key}"`);
    }

    if (!(value instanceof Type)) {
      throw new TypeError('value must be instanceof Type');
    }

    // create a new one and named <key>
    self[key] = new (value.constructor)(key);
    return true;
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
      return lodash.isFunction(v) ? new Entry(k, { type: v }) : new Entry(k, v);
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
  constructor(key, { path = '', type: _type = type, 'default': _default, required = false, ...options } = {}) {
    if (!lodash.every(Object.values(options), lodash.isFunction)) {
      throw new TypeError(` not every value in options keys=[${Object.keys(options)}] are function`);
    }

    this.path = path ? `${path}.${key}` : key;
    this.type = _type;
    this.default = lodash.isFunction(_default) ? _default : () => _default;
    this.required = lodash.isFunction(required) ? required : () => required;
    this.condition = function(value, dist) {
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

// --------------------------------------------------------
const validatorLib = require('validator');

const type = new Type();

type.null = type.$extend(lodash.isNull);
type.boolean = type.$extend(lodash.isBoolean);
type.string = type.$extend(lodash.isString);
type.number = type.$extend(v => !Number.isNaN(v) && lodash.isNumber(v) && Number.isFinite(v));
type.integer = type.$extend(Number.isInteger);
type.array = type.$extend(Array.isArray);
type.object = type.$extend(v => lodash.isObject(v) && !Array.isArray(v));
type.buffer = type.$extend(lodash.isBuffer);

type.bool = type.boolean.$parse(v => ({ false: false, true: true })[v.toLowerCase()]);
type.str = type.string.$parse(v => v.trim()).$extend(v => v.length > 0);
type.num = type.number.$parse(Number);
type.int = type.integer.$parse(Number);
type.arr = type.array.$parse(v => v.split(','));
type.obj = type.object.$parse(JSON.parse);

type.json = type.$extend(v => JSON.parse(v) || true); // "func() || true" means no Error is good
type.hex = type.string.$extend(v => /^[0-9a-f]+$/i.test(v));
type.mongoId = type.hex.$extend(v => v.length === 24);
type.md5 = type.hex.$extend(v => v.length === 32); // and md4
type.sha1 = type.hex.$extend(v => v.length === 40);
type.sha256 = type.hex.$extend(v => v.length === 96);
type.sha512 = type.hex.$extend(v => v.length === 128);

// type.hexStrict = type.string.$extend(v => /^0x[0-9a-f]+$/i.test(v));

type.base64 = type.string.$extend(validatorLib.isBase64);
type.jwt = type.$extend(validatorLib.isJWT);
type.uuid = type.$extend(validatorLib.isUUID);
type.ip = type.$extend(validatorLib.isIP); // IPv4 and IPv6
type.url = type.$extend(validatorLib.isURL);
type.uri = type.$extend(validatorLib.isDataURI);
type.magnet = type.$extend(validatorLib.isMagnetURI);
type.email = type.$extend(validatorLib.isEmail);

module.exports = type;
module.exports.TypeError = TypeError;
