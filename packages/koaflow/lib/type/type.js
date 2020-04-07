const lodash = require('lodash');
const Parser = require('./Parser');

// ----------------------------------------------------------------------------
const type = new Proxy(new Parser(), {
  set(self, key, parser) {
    if (!(parser instanceof Parser)) {
      throw new Error('value must be instanceof Parser');
    }

    self[key] = parser.$named(key);
    return true;
  },

  get(self, name) {
    const parser = self[name];
    if (parser === undefined) {
      throw new Error(`do not have value named "${name}"`);
    }
    return parser;
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
    return /^(0x)?[0-9a-f]*$/i.test(v);
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
    return /^[a-f0-9]{32}$/.test(v);
  },
);

module.exports = type;
