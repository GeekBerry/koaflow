const parameter = require('../lib/parameter');

const func = parameter({
  id: { type: Number, required: true, enum: [1, 2, 3] },
  page: { path: 'query', type: Number, 'bigger then 0': v => v > 0 },
  limit: { path: 'query', default: 10 },
  title: { path: 'body', required: v => v.id > 10 },
  skip: { path: 'body', default: v => (v.page - 1) * v.limit },
  desc: { path: 'body', 'logger than title': (v, o) => v.length > o.title.length },
});

test('normal', () => {
  expect(func({
    id: 1,
    query: { page: '1' },
  })).toEqual({
    id: 1,
    page: 1,
    limit: 10,
    skip: 0,
  });
});

test('miss required', () => {
  expect(() =>
    func({ query: { page: '1' } }),
  ).toThrow('"id" is required');
});

test('error enum', () => {
  expect(() =>
    func({ id: 4 }),
  ).toThrow('"id" do not match enum');
});

test('error condition', () => {
  expect(() =>
    func({
      id: 1,
      query: { page: 0 },
    }),
  ).toThrow('"query.page" do not match condition "bigger then 0"');
});

test('error complicated condition', () => {
  expect(() =>
    func({
      id: 1,
      body: { title: 'title', desc: 'x' },
    }),
  ).toThrow('"body.desc" do not match condition "logger than title"');
});
