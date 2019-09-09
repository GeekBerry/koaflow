const lodash = require('lodash');
const assert = require('koaflow-test/assert');

const type = require('../index');

let ret;

test('error not exist type name', () => {
  try {
    ret = type.notExistTypeName;
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('set duplication name', () => {
  try {
    type.array = type.$extend(Array.isArray);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('set not a type', () => {
  try {
    type.myType = () => true;
  } catch (e) {
    ret = e;
  }

  assert(ret instanceof type.TypeError);
});

// ----------------------------------------------------------------------------
test('null to be null', () => {
  ret = type.null(null);
  assert(ret, null);
});

test('null not accept "null"', () => {
  try {
    ret = type.null('null');
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

// ----------------------------------------------------------------------------
test('boolean to be true', () => {
  ret = type.boolean(true);
  assert(ret, true);
});

test('boolean to be false', () => {
  ret = type.boolean(false);

  assert(ret, false);
});

test('boolean to equal Boolean', () => {
  ret = type.boolean(Boolean(1));
  assert(ret, true);
});

test('boolean not accept number', () => {
  try {
    ret = type.boolean(1);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('bool to be true', () => {
  ret = type.bool(true);
  assert(ret, true);
});

test('bool string true', () => {
  ret = type.bool('TrUe');
  assert(ret, true);
});

// ----------------------------------------------------------------------------
test('string', () => {
  ret = type.string(' abc ');
  assert(ret, ' abc ');
});

test('string accept empty string', () => {
  ret = type.string('');
  assert(ret, '');
});

test('string to equal String', () => {
  ret = type.string(String(' abc '));
  assert(ret, ' abc ');
});

test('string not accept buffer', () => {
  try {
    ret = type.string(Buffer.from(' abc '));
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('str', () => {
  ret = type.str(' abc ');
  assert(ret, 'abc');
});

test('str not accept empty', () => {
  try {
    ret = type.str('');
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

// ----------------------------------------------------------------------------
test('number', () => {
  ret = type.number(3.14);
  assert(ret, 3.14);
});

test('number to equal Number', () => {
  ret = type.number(Number('3.14'));
  assert(ret, 3.14);
});

test('number not accept number string', () => {
  try {
    ret = type.number(NaN);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('number not accept NaN', () => {
  try {
    ret = type.number(NaN);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('number not accept Infinity', () => {
  try {
    ret = type.number(Infinity);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('num', () => {
  ret = type.num('-3.14');
  assert(ret, -3.14);
});

test('num accept hex string', () => {
  ret = type.num('0xff');
  assert(ret, 255);
});
// ----------------------------------------------------------------------------
test('integer', () => {
  ret = type.integer(123);
  assert(ret, 123);
});

test('integer accept integer able', () => {
  ret = type.integer(123.0);
  assert(ret, 123);
});

test('integer not accept integer string', () => {
  try {
    ret = type.integer('123');
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('integer not accept float', () => {
  try {
    ret = type.integer(3.14);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('integer not accept NaN', () => {
  try {
    ret = type.integer(NaN);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('integer not accept Infinity', () => {
  try {
    ret = type.integer(Infinity);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('int', () => {
  ret = type.int('123');
  assert(ret, 123);
});

// ----------------------------------------------------------------------------
test('array', () => {
  ret = type.array([]);
  assert(ret, [undefined]);
});

test('array to equal Array', () => {
  ret = type.array(Array());
  assert(ret, [undefined]);
});

test('array not accept array string', () => {
  try {
    ret = type.array('1,2');
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('arr', () => {
  ret = type.arr('1,,3,');
  assert(ret, ['1', '', '3', '', undefined]);
});

test('arr not accept json', () => {
  ret = type.arr('[1,2,3]');
  assert(ret, ['[1', '2', '3]', undefined]);
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
  assert(ret instanceof type.TypeError);
});

test('object not accept object string', () => {
  try {
    ret = type.object('{}');
  } catch (e) { ret = e;}
  assert(ret instanceof type.TypeError);
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
  assert(ret instanceof type.TypeError);
});

test('obj not accept array', () => {
  try {
    ret = type.obj('[1,2,3]');
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});
// ----------------------------------------------------------------------------
test('buffer', () => {
  ret = type.buffer(Buffer.from('abc'));
  assert(ret instanceof Buffer);
});

// ----------------------------------------------------------------------------
test('mongoId', () => {
  const string = lodash.range(24).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.mongoId(string);
  assert(ret, string);
});

test('md5', () => {
  const string = lodash.range(32).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.md5(string);
  assert(ret, string);
});

test('sha1', () => {
  const string = lodash.range(40).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.sha1(string);
  assert(ret, string);
});

test('sha256', () => {
  const string = lodash.range(96).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.sha256(string);
  assert(ret, string);
});

test('sha512', () => {
  const string = lodash.range(128).map(() => '0123456789abcdefABCDEF'[lodash.random(0, 21)]).join('');
  ret = type.sha512(string);
  assert(ret, string);
});

test('base64', () => {
  ret = type.base64('WWVzIQ==');
  assert(ret, 'WWVzIQ==');
});

test('json', () => {
  ret = type.json('{"name":"Tom"}');
  assert(ret, '{"name":"Tom"}');
});

test('json accept not object json', () => {
  ret = type.json('0');
  assert(ret, '0');
});

test('hex', () => {
  ret = type.hex('0123456789abcdefABCDEF');
  assert(ret, '0123456789abcdefABCDEF');
});

test('hex not accept 0x prefix', () => {
  try {
    ret = type.hex('0x12');
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('hex0x', () => {
  ret = type.hex0x('0x0123456789abcdefABCDEF');
  assert(ret, '0x0123456789abcdefABCDEF');
});

test('ip', () => {
  ret = type.ip('127.0.0.1');
  assert(ret, '127.0.0.1');
});

test('url', () => {
  ret = type.url('http://xxx.com');
  assert(ret, 'http://xxx.com');
});

// ----------------------------------------------------------------------------
test('str or int or null', () => {
  const t = type.str.$or(type.int).$or(type.null);
  assert(t(' abc '), 'abc');
  assert(t(1), 1);
  assert(t(null), null);

  try {
    ret = t(true);
  } catch (e) {
    ret = e;
  }
  assert(ret instanceof type.TypeError);
});

test('arr of int', () => {
  ret = type.arr.$each(type.int)('1,2,3');
  assert(ret, [1, 2, 3, undefined]);
});
