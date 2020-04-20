const lodash = require('lodash');
const Type = require('./Type');

// ----------------------------------------------------------------------------
const type = new Proxy(new Type(), {
  set(self, key, type) {
    if (!(type instanceof Type)) {
      throw new Error('value must be instanceof Type');
    }

    self[key] = type.$named(key);
    return true;
  },

  get(self, name) {
    const type = self[name];
    if (type === undefined) {
      throw new Error(`do not have type named "${name}"`);
    }
    return type;
  },
});

type.any = type.$validate(() => true);
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
type.arr = type.array.$parse(v => v.split(','));
type.obj = type.object.$parse(JSON.parse);

type.str = type.string.$parse(v => v.trim()).$validate(
  function notEmpty(v) {
    return v.length > 0;
  },
);

type.hex = type.string.$validate(
  function hexRegex(v) {
    return /^(0x)?[0-9a-f]+$/i.test(v);
  },
);

type.json = type.string.$validate(
  function isJson(v) {
    JSON.parse(v);
    return true; // `true` means no Error is good
  },
);

type.md5 = type.string.$validate(
  function md5Regex(v) {
    return /^[0-9a-f]{32}$/.test(v);
  },
);

module.exports = type;
