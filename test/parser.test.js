const parser = require('../lib/parser');

test('array', () => {
  const func = parser([Number]);

  expect(func(['1', '2', '3'])).toEqual([1, 2, 3]);
});

test('array empty', () => {
  const func = parser([]);

  expect(func(['1', '2', '3'])).toEqual(['1', '2', '3']);
  expect(() => func()).toThrow('expected array, got undefined');
});

test('object', () => {
  const func = parser({
    a: Number,
    b: Boolean,
    c: {
      x: v => Buffer.from(v),
    },
  });

  expect(() => func()).toThrow('expected plain object, got undefined');

  const result = func({
    a: '0x100',
    b: 100,
    c: {
      x: 'abc',
      y: 'ABC',
    },
    d: null,
  });

  expect(result).toEqual({
    a: 256,
    b: true,
    c: {
      x: Buffer.from('abc'),
      y: 'ABC',
    },
    d: null,
  });
});

test('function', () => {
  const func = parser(BigInt);

  expect(func(1)).toEqual(BigInt(1));
  expect(func('0x10')).toEqual(BigInt(16));
  expect(() => func()).toThrow('Cannot convert undefined to a BigInt');
});

test('value', () => {
  const func = parser(null);

  expect(func(null)).toEqual(null);
  expect(() => func(true)).toThrow('expected to be null, got true');
});
