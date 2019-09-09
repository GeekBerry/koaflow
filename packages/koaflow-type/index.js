const lodash = require('lodash');
const validatorLib = require('validator');

const Type = require('./type');

// --------------------------------------------------------
const any = new Type();

const type = new Proxy(any, {
  apply(self, _, [v]) {
    return lodash.isFunction(v) ? self.$extend(v) : self.$schema(v);
  },

  get(self, name) {
    const type = self[name];
    if (!type && lodash.isString(name)) {
      throw new Type.TypeError(`do not have type named "${name}"`);
    }
    return type;
  },

  set(self, key, value) {
    if (key in self) {
      throw new Type.TypeError(`already have type named "${key}"`);
    }

    if (!(value instanceof Type)) {
      throw new Type.TypeError('value must be instanceof Type');
    }

    // create a new one and named <key>
    self[key] = new (value.constructor)(key);
    return true;
  },
});

type.any = any;
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

type.hex0x = type.string.$extend(v => /^0x[0-9a-f]*$/i.test(v));

type.base64 = type.string.$extend(validatorLib.isBase64);
type.jwt = type.$extend(validatorLib.isJWT);
type.uuid = type.$extend(validatorLib.isUUID);
type.ip = type.$extend(validatorLib.isIP); // IPv4 and IPv6
type.url = type.$extend(validatorLib.isURL);
type.uri = type.$extend(validatorLib.isDataURI);
type.magnet = type.$extend(validatorLib.isMagnetURI);
type.email = type.$extend(validatorLib.isEmail);

module.exports = type;
