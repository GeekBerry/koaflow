const lodash = require('lodash');

function $default(data) {
  return asType((value) => {
    if (value === undefined) {
      value = data;
    }
    return this(value);
  });
}

function $parse(func, condition = lodash.isString) {
  return asType((parser) => {
    if (condition(parser)) {
      parser = func(parser);
    }
    return this(parser);
  });
}

function $validate(validator) {
  return asType((value) => {
    value = this(value);
    if (!validator(value)) {
      throw new Error(`value (${value}) do not match "${validator.name || 'validator'}"`);
    }
    return value;
  });
}

function $each(validator) {
  return asType((array) => {
    return this(array).map(validator);
  });
}

function $or(func) {
  return asType((value) => {
    try {
      return this(value);
    } catch (e) {
      return func(value);
    }
  });
}

function asType(func) {
  func.$default = $default;
  func.$parse = $parse;
  func.$validate = $validate;
  func.$or = $or;
  func.$each = $each;
  return func;
}

// ============================================================================
const type = asType(v => v);
type.null = type.$validate(lodash.isNull);
type.boolean = type.$validate(lodash.isBoolean);
type.string = type.$validate(lodash.isString);
type.number = type.$validate(Number.isFinite);
type.integer = type.$validate(Number.isSafeInteger);
type.array = type.$validate(Array.isArray);
type.object = type.$validate(lodash.isPlainObject);
type.buffer = type.$validate(Buffer.isBuffer);

type.bool = type.boolean.$parse(v => ({ false: false, true: true })[v]);
type.num = type.number.$parse(Number);
type.int = type.integer.$parse(Number);
type.uint = type.int.$validate(v => v >= 0);
type.arr = type.array.$parse(v => v.split(','));
type.obj = type.object.$parse(JSON.parse);

type.hex = type.string.$validate(v => /^(0x)?[0-9a-f]+$/i.test(v));
type.md5 = type.string.$validate(v => /^[0-9a-f]{32}$/.test(v));
type.json = type.string.$validate(v => JSON.parse(v) || true);
type.str = type.string.$parse(v => v.trim()).$validate(v => v.length);

module.exports = type;
