const LogicError = require('../src/error');

test('extend LogicError', () => {
  const XError = LogicError.extend({ code: 1001, stack: 'stack' });

  const e = new XError('x error');

  expect(e.name).toEqual('LogicError');
  expect(e.code).toEqual(1001);
  expect(e.message).toEqual('x error');

  expect({ ...e }).toEqual({ name: 'LogicError', code: 1001, message: 'x error' });
});

test('copy constructor', () => {
  const TestError = LogicError.extend({ name: 'TestError', code: 9999 });

  const e = new Error('normal error');
  const eTest = new TestError(e);

  expect(e.message).toEqual(eTest.message);
  expect(e.stack).toEqual(eTest.stack);
});
