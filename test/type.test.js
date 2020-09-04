const type = require('../lib/type');

test('not a function', () => {
  expect(() =>
    type.xxx(1),
  ).toThrow('type.xxx is not a function');
});

test('empty to be undefined', () => {
  expect(type.undefined()).toEqual(undefined);
});

test('undefined to be undefined', () => {
  expect(type.undefined(undefined)).toEqual(undefined);
});

test('undefined not accept null', () => {
  expect(() => type.undefined(null)).toThrow('do not match "isUndefined"');
});

// ----------------------------------------------------------------------------
test('null to be null', () => {
  expect(type.null(null)).toEqual(null);
});

test('null not accept "null"', () => {
  expect(() => type.null('null')).toThrow('do not match "isNull"');
});

test('nul accept "null"', () => {
  expect(type.nul('null')).toEqual(null);
});

test('nul accept ""', () => {
  expect(type.nul('')).toEqual(null);
});

test('nul not accept undefined"', () => {
  expect(() => type.nul()).toThrow('do not match "isNull"');
});

// ----------------------------------------------------------------------------
test('boolean to be true', () => {
  expect(type.boolean(true)).toEqual(true);
});

test('boolean to be false', () => {
  expect(type.boolean(false)).toEqual(false);
});

test('boolean not accept number', () => {
  expect(() => type.boolean(1)).toThrow('do not match "isBoolean"');
});

test('bool to be true', () => {
  expect(type.bool(true)).toEqual(true);
});

test('bool to be false', () => {
  expect(type.bool(false)).toEqual(false);
});

test('bool string false', () => {
  expect(type.bool('false')).toEqual(false);
});

// ----------------------------------------------------------------------------
test('string', () => {
  expect(type.string(' abc ')).toEqual(' abc ');
});

test('string accept empty string', () => {
  expect(type.string('')).toEqual('');
});

test('string not accept buffer', () => {
  expect(() => type.string(Buffer.from('abc'))).toThrow('do not match "isString"');
});

test('str', () => {
  expect(type.str(' abc ')).toEqual('abc');
});

test('str not accept empty', () => {
  expect(() => type.str('')).toThrow('do not match "validator"');
});

// ----------------------------------------------------------------------------
test('number', () => {
  expect(type.number(3.14)).toEqual(3.14);
});

test('number not accept string', () => {
  expect(() => type.number('3.14')).toThrow('do not match "isFinite"');
});

test('number not accept NaN', () => {
  expect(() => type.number(NaN)).toThrow('do not match "isFinite"');
});

test('number not accept Infinity', () => {
  expect(() => type.number(Infinity)).toThrow('do not match "isFinite"');
});

test('num', () => {
  expect(type.num('-3.14')).toEqual(-3.14);
});

test('num accept hex', () => {
  expect(type.num('0xff')).toEqual(255);
});

// ----------------------------------------------------------------------------
test('integer', () => {
  expect(type.integer(123)).toEqual(123);
});

test('integer not accept string', () => {
  expect(() => type.integer('100')).toThrow('do not match "isSafeInteger"');
});

test('integer not accept float', () => {
  expect(() => type.integer(3.14)).toThrow('do not match "isSafeInteger"');
});

test('int', () => {
  expect(type.int('123')).toEqual(123);
});

// ----------------------------------------------------------------------------
test('array', () => {
  expect(type.array([])).toEqual([]);
});

test('arr', () => {
  expect(type.arr('1,,3,')).toEqual(['1', '', '3', '']);
});

test('arr not accept json', () => {
  expect(type.arr('[1,2,3]')).toEqual(['[1', '2', '3]']);
});

// ----------------------------------------------------------------------------
test('object', () => {
  expect(type.object({ a: 1 })).toEqual({ a: 1 });
});

test('object not accept array', () => {
  expect(() => type.object([])).toThrow('do not match "isPlainObject"');
});

test('obj', () => {
  expect(type.obj({ a: 1 })).toEqual({ a: 1 });
});

test('obj accept json', () => {
  expect(type.obj('{"name":"Tom"}')).toEqual({ name: 'Tom' });
});

test('obj not accept json array', () => {
  expect(() => type.obj('[1,2,3]')).toThrow('do not match "isPlainObject"');
});

// ----------------------------------------------------------------------------
test('buffer', () => {
  expect(type.buffer(Buffer.from('abc'))).toEqual(Buffer.from('abc'));
});

test('buffer not accept string', () => {
  expect(() => type.buffer('abc')).toThrow('do not match "isBuffer"');
});

test('hex', () => {
  expect(type.hex('12abCD')).toEqual('12abCD');
});

test('hex prefix', () => {
  expect(type.hex('0x12abCD')).toEqual('0x12abCD');
});

test('json', () => {
  expect(type.json('{"name":"Tom"}')).toEqual('{"name":"Tom"}');
});

// ============================================================================
test('$default', () => {
  const func = type.int.$default(100);

  expect(func()).toEqual(100);
});

test('$or', () => {
  const func = (type.str).$or(type.int).$or(type.null);

  expect(func(' abc ')).toEqual('abc');
  expect(func(1)).toEqual(1);
  expect(func(null)).toEqual(null);
  expect(() => func(true)).toThrow('do not match "isNull"');
});

test('$array', () => {
  const func = type.arr.$array(type.int);

  expect(func('1,0xa')).toEqual([1, 10]);
  expect(() => func([1, 3.14])).toThrow('do not match "isSafeInteger"');
});

test('$object', () => {
  const func = type.$object({ a: type.int, b: type.bool });

  expect(func({ a: '0xa', c: 'string' })).toEqual({ a: 10 });
  expect(() => func({ b: 1 })).toThrow('do not match "isBoolean"');
});
