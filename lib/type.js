const lodash = require('lodash');

function $before(func) {
  return asType(value => this(func(value)));
}

function $default(data) {
  return $before.call(this, value => value === undefined ? data : value);
}

function $parse(parser, condition = lodash.isString) {
  return $before.call(this, value => condition(value) ? parser(value) : value);
}

function $after(func) {
  return asType(value => func(this(value)));
}

function $validate(validator, name) {
  return $after.call(this, value => {
    if (!validator(value)) {
      throw new Error(`value=${value} do not match "${name || validator.$name || validator.name || 'validator'}"`);
    }
    return value;
  });
}

function $array(func) {
  return $after.call(this, array => {
    if (!Array.isArray(array)) {
      throw new Error(`value=${array} not a array`);
    }

    return array.map((value, index) => {
      try {
        return func(value);
      } catch (e) {
        throw new Error(`index=${index}, ${e.message}`);
      }
    });
  });
}

function $object(keyToFunc, additionalProperties = false) {
  return $after.call(this, object => {
    if (!lodash.isPlainObject(object)) {
      throw new Error(`value=${object} not a plain object`);
    }

    const result = lodash.mapValues(keyToFunc, (func, key) => {
      try {
        const value = object[key];
        return value === undefined ? value : func(value);
      } catch (e) {
        throw new Error(`key=${key}, ${e.message}`);
      }
    });
    return !additionalProperties ? result : lodash.defaults(result, object);
  });
}

function $or(func) {
  return asType((value) => {
    try {
      return this(value);
    } catch (error) {
      try {
        return func(value);
      } catch (e) {
        throw new Error(`${error.message} | ${e.message}`);
      }
    }
  });
}

function asType(func) {
  // execute before
  func.$before = $before;
  func.$default = $default;
  func.$parse = $parse;

  // execute after
  func.$after = $after;
  func.$validate = $validate;
  func.$array = $array;
  func.$object = $object;

  func.$or = $or;

  return func;
}

// ============================================================================
const type = new Proxy(asType(v => v), {
  set(object, key, value) {
    value.$name = key;
    return Reflect.set(object, key, value);
  },
});

type.any = type;
type.undefined = type.$validate(lodash.isUndefined);
type.null = type.$validate(lodash.isNull);
type.boolean = type.$validate(lodash.isBoolean);
type.string = type.$validate(lodash.isString);
type.number = type.$validate(Number.isFinite);
type.integer = type.$validate(Number.isSafeInteger);
type.array = type.$validate(Array.isArray);
type.object = type.$validate(lodash.isPlainObject);
type.buffer = type.$validate(Buffer.isBuffer);

type.nul = type.null.$parse(v => ({ '': null, 'null': null })[v]);
type.bool = type.boolean.$parse(v => ({ false: false, true: true })[v]);
type.num = type.number.$parse(v => v.length ? Number(v) : v);
type.int = type.integer.$parse(v => v.length ? Number(v) : v);
type.uint = type.int.$validate(v => v >= 0);
type.arr = type.array.$parse(v => v.split(','));
type.obj = type.object.$parse(JSON.parse);

type.hex = type.string.$validate(v => /^(0x)?[0-9a-f]+$/i.test(v));
type.md5 = type.string.$validate(v => /^[0-9a-f]{32}$/.test(v));
type.json = type.string.$validate(v => JSON.parse(v) || true);
type.str = type.string.$parse(v => v.trim()).$validate(v => v.length);

module.exports = type;
