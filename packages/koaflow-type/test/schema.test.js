const type = require('../');

let ret;
let func;

beforeAll(() => {
  func = type({
    id: { type: type.int, required: true },
    page: { path: 'query', type: type.int.$or(type.null), 'bigger then 0': v => v > 0 },
    limit: { path: 'query', default: 10 },
    title: { path: 'body', required: v => v.id > 10 },
    skip: { path: 'body', default: v => (v.page - 1) * v.limit },
    desc: { path: 'body', 'logger than title': (v, o) => v.length > o.title.length },
  });
});

test('error condition', () => {
  try {
    ret = type({
      id: { 'other condition': 'not a function' },
    });
  } catch (e) {
    ret = e;
  }

  expect(ret instanceof type.TypeError).toBe(true);
});

test('normal', () => {
  ret = func({
    id: 1,
    query: { page: '1' },
  });

  expect(ret).toEqual({
    id: 1,
    page: 1,
    limit: 10,
    skip: 0,
  });
});

test('test to type.xxx.$schema', () => {
  ret = type.obj.$schema({
    id: type.integer,
    page: { type: type.integer },
  })('{"id":1,"page":1}');

  expect(ret).toEqual({
    id: 1,
    page: 1,
  });
});

test('with func', () => {
  ret = type({
    name: type.str,
    age: type.number,
  })({ name: 'Tom', age: 18, city: 'BeiJing' });

  expect(ret).toEqual({
    name: 'Tom',
    age: 18,
  });
});

test('miss required', () => {
  try {
    ret = func({
      query: { page: '1' },
    });
  } catch (e) {
    ret = e;
  }

  expect(ret instanceof type.TypeError).toBe(true);
});

test('error condition', () => {
  try {
    ret = func({
      id: 1,
      query: { page: 0 },
    });
  } catch (e) {
    ret = e;
  }

  expect(ret instanceof type.TypeError).toBe(true);
});

test('error complicated condition', () => {
  try {
    ret = func({
      id: 1,
      body: {
        title: 'title',
        desc: 'x',
      },
    });
  } catch (e) {
    ret = e;
  }
  expect(ret instanceof type.TypeError).toBe(true);
});

afterEach(() => {
  // console.log(ret);
  ret = undefined;
});
