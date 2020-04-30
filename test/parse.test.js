const parse = require('../lib/parse');

test('parse Error', () => {
  expect(() => parse(1)).toThrow('unexpect schema type');
});

test('parseFunction', () => {
  const parser = parse(Number);

  expect(parser(true)).toEqual(1);
  expect(parser('0x10')).toEqual(16);
  expect(parser(undefined)).toEqual(undefined);
});

test('parseObject', () => {
  const parser = parse({
    a: Number,
    b: Boolean,
    c: {
      x: v => Buffer.from(v),
    },
  });

  const result = parser({
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

  expect(parser(undefined)).toEqual(undefined);
});

test('parseArray', () => {
  const parser = parse([Number]);

  expect(parser(['1', '2', '3'])).toEqual([1, 2, 3]);
  expect(parser(undefined)).toEqual(undefined);
});
