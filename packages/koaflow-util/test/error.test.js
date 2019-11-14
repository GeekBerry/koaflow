const LogicError = require('../lib/LogicError');

test('extend LogicError', () => {
  const XError = LogicError.extend({ code: 1001, stack: 'stack' });

  const err = new XError('x error');

  expect(err.message).toBe('x error');
  expect(err.code).toBe(1001);

  expect(Object.keys(err).length).toBe(2);
  expect({ ...err }).toEqual({ code: 1001, message: 'x error' });
});

test('copy constructor', () => {
  const TestError = LogicError.extend('TestError', { code: 9999 });

  const e = new Error('normal error');
  const eTest = new TestError(e);

  expect(e.message).toBe(eTest.message);
  expect(e.stack).toBe(eTest.stack);
});
