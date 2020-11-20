const parameter = require('../lib/parameter');
const type = require('../lib/type');

const func = parameter({
  id: { type: type.uint, required: true, enum: [1, 2, 3] },
  page: { path: 'query', type: type.uint, 'bigger then 0': v => v > 0 },
  limit: { path: 'query', default: 10 },
  skip: { path: 'body', default: v => (v.page - 1) * v.limit },
  title: { path: 'body', required: v => v.id > 10 },
  text: { path: 'body', 'logger than title': (v, o) => v.length > o.title.length },
  length: { path: 'text' },
});

test('normal', () => {
  expect(
    func({
      id: 1,
      query: { page: '1' },
      body: {
        title: 'title',
        text: 'context',
      },
    }),
  ).toEqual({
    id: 1,
    page: 1,
    limit: 10,
    skip: 0,
    title: 'title',
    text: 'context',
    length: 7,
  });
});

test('miss required', () => {
  expect(() => func({ query: { page: '1' } })).toThrow('"id" is required');
});

test('error enum', () => {
  expect(
    () => func({ id: 4 }),
  ).toThrow('"id" do not match enum');
});

test('error type', () => {
  expect(
    () => func({ id: -1 }),
  ).toThrow('-1 do not match "uint"');
});

test('error condition', () => {
  expect(
    () => func({
      id: 1,
      query: { page: 0 },
    }),
  ).toThrow('"query.page" do not match condition "bigger then 0"');
});

test('error complicated condition', () => {
  expect(
    () => func({
      id: 1,
      body: { title: 'title', text: 'x' },
    }),
  ).toThrow('"body.text" do not match condition "logger than title"');
});

test('error condition type', () => {
  expect(
    () => parameter({
      name: { condition: 'not function' },
    }),
  ).toThrow('not every conditions [condition] are function');
});
