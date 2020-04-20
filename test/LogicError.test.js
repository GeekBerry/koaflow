const LogicErrorTest = require('../lib/util/LogicError');

test('extend LogicError', () => {
  const XError = LogicErrorTest.extend({ code: 1001, stack: 'stack' });
  expect(XError.name).toEqual('LogicError');
  expect(XError.code).toEqual(1001);

  const e = new XError('x error');
  expect(e.name).toEqual('LogicError');
  expect(e.code).toEqual(1001);
  expect(e.message).toEqual('x error');

  expect({ ...e }).toEqual({ name: 'LogicError', code: 1001, message: 'x error' });
});

test('copy constructor', () => {
  const TestError = LogicErrorTest.extend({ name: 'TestError', code: 9999 });
  expect(TestError.name).toEqual('TestError');
  expect(TestError.code).toEqual(9999);

  const error = new Error('normal error');
  const e = new TestError(error);
  expect(e.name).toEqual('TestError');
  expect(e.code).toEqual(9999);
  expect(e.message).toEqual(error.message);
  expect(e.stack).toEqual(error.stack);
});
