const lodash = require('lodash');
const type = require('../index');

let ret;

test('error not exist type name', () => {
  try {
    ret = type.notExistTypeName;
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('set not a type', () => {
  try {
    type.myType = () => true;
  } catch (e) {
    ret = e;
  }

  expect(ret instanceof type.TypeError).toBe(true);
});

// ----------------------------------------------------------------------------
test('null to be null', () => {
  ret = type.null(null);

  expect(ret).toBe(null);
});

test('null not accept "null"', () => {
  try {
    ret = type.null('null');
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

// ----------------------------------------------------------------------------
test('boolean to be true', () => {
  ret = type.boolean(true);
  expect(ret).toBe(true);
});

test('boolean to be false', () => {
  ret = type.boolean(false);

  expect(ret).toBe(false);
});

test('boolean to equal Boolean', () => {
  ret = type.boolean(Boolean(1));

  expect(ret).toBe(true);
});

test('boolean not accept number', () => {
  try {
    ret = type.boolean(1);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('bool to be true', () => {
  ret = type.bool(true);

  expect(ret).toBe(true);
});

test('bool string true', () => {
  ret = type.bool('TrUe');

  expect(ret).toBe(true);
});

// ----------------------------------------------------------------------------
test('string', () => {
  ret = type.string(' abc ');

  expect(ret).toBe(' abc ');
});

test('string accept empty string', () => {
  ret = type.string('');

  expect(ret).toBe('');
});

test('string to equal String', () => {
  ret = type.string(String(' abc '));

  expect(ret).toBe(' abc ');
});

test('string not accept buffer', () => {
  try {
    ret = type.string(Buffer.from(' abc '));
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('str', () => {
  ret = type.str(' abc ');

  expect(ret).toBe('abc');
});

test('str not accept empty', () => {
  try {
    ret = type.str('');
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

// ----------------------------------------------------------------------------
test('number', () => {
  ret = type.number(3.14);

  expect(ret).toBe(3.14);
});

test('number to equal Number', () => {
  ret = type.number(Number('3.14'));

  expect(ret).toBe(3.14);
});

test('number not accept number string', () => {
  try {
    ret = type.number(NaN);
  } catch (e) {
    ret = e;
  }

  expect(ret instanceof type.TypeError).toBe(true);
});

test('number not accept NaN', () => {
  try {
    ret = type.number(NaN);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('number not accept Infinity', () => {
  try {
    ret = type.number(Infinity);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('num', () => {
  ret = type.num('-3.14');

  expect(ret).toBe(-3.14);
});

test('num accept hex string', () => {
  ret = type.num('0xff');

  expect(ret).toBe(255);
});
// ----------------------------------------------------------------------------
test('integer', () => {
  ret = type.integer(123);

  expect(ret).toBe(123);
});

test('integer accept integer able', () => {
  ret = type.integer(123.0);

  expect(ret).toBe(123);
});

test('integer not accept integer string', () => {
  try {
    ret = type.integer('123');
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('integer not accept float', () => {
  try {
    ret = type.integer(3.14);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('integer not accept NaN', () => {
  try {
    ret = type.integer(NaN);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('integer not accept Infinity', () => {
  try {
    ret = type.integer(Infinity);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('int', () => {
  ret = type.int('123');

  expect(ret).toBe(123);
});

// ----------------------------------------------------------------------------
test('array', () => {
  ret = type.array([]);

  expect(ret).toEqual([]);
});

test('array to equal Array', () => {
  ret = type.array(Array());

  expect(ret).toEqual([]);
});

test('array not accept array string', () => {
  try {
    ret = type.array('1,2');
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('arr', () => {
  ret = type.arr('1,,3,');

  expect(ret).toEqual(['1', '', '3', '']);
});

test('arr not accept json', () => {
  ret = type.arr('[1,2,3]');

  expect(ret).toEqual(['[1', '2', '3]']);
});

// ----------------------------------------------------------------------------
test('object', () => {
  ret = type.object({});
  expect(ret).toStrictEqual({});
});

test('object not accept array', () => {
  try {
    ret = type.object([]);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('object not accept object string', () => {
  try {
    ret = type.object('{}');
  } catch (e) { ret = e;}
  expect(ret instanceof type.TypeError).toBe(true);
});

test('obj', () => {
  ret = type.obj({ name: 'Tom' });
  expect(ret).toStrictEqual({ name: 'Tom' });
});

test('obj accept json', () => {
  ret = type.obj('{"name":"Tom"}');
  expect(ret).toStrictEqual({ name: 'Tom' });
});

test('obj not a json', () => {
  try {
    ret = type.obj('{"name"');
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('obj not accept array', () => {
  try {
    ret = type.obj('[1,2,3]');
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});
// ----------------------------------------------------------------------------
test('buffer', () => {
  ret = type.buffer(Buffer.from('abc'));

  expect(ret instanceof Buffer).toBe(true);
});

// ----------------------------------------------------------------------------
test('mongoId', () => {
  const string = lodash.range(24).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.mongoId(string);

  expect(ret).toBe(string);
});

test('md5', () => {
  const string = lodash.range(32).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.md5(string);

  expect(ret).toBe(string);
});

test('sha1', () => {
  const string = lodash.range(40).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.sha1(string);

  expect(ret).toBe(string);
});

test('sha256', () => {
  const string = lodash.range(96).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.sha256(string);

  expect(ret).toBe(string);
});

test('sha512', () => {
  const string = lodash.range(128).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.sha512(string);

  expect(ret).toBe(string);
});

test('base64', () => {
  ret = type.base64('WWVzIQ==');

  expect(ret).toBe('WWVzIQ==');
});

test('json', () => {
  ret = type.json('{"name":"Tom"}');

  expect(ret).toBe('{"name":"Tom"}');
});

test('json accept not object json', () => {
  ret = type.json('0');

  expect(ret).toBe('0');
});

test('hex', () => {
  ret = type.hex('0123456789abcdefABCDEF');

  expect(ret).toBe('0123456789abcdefABCDEF');
});

test('hex not accept 0x prefix', () => {
  try {
    ret = type.hex('0x12');
  } catch (e) {
    ret = e;
  }

  expect(ret instanceof type.TypeError).toBe(true);
});

test('hex0x', () => {
  ret = type.hex0x('0x0123456789abcdefABCDEF');

  expect(ret).toBe('0x0123456789abcdefABCDEF');
});

test('ip', () => {
  ret = type.ip('127.0.0.1');

  expect(ret).toBe('127.0.0.1');
});

test('url', () => {
  ret = type.url('http://xxx.com');

  expect(ret).toBe('http://xxx.com');
});

// ----------------------------------------------------------------------------
test('str or int or null', () => {
  const t = type.str.$or(type.int).$or(type.null);

  expect(t(' abc ')).toBe('abc');
  expect(t(1)).toBe(1);
  expect(t(null)).toBe(null);

  try {
    ret = t(true);
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

test('arr of int', () => {
  ret = type.arr.$each(type.int)('1,2,3');

  expect(ret).toEqual([1, 2, 3]);
});
