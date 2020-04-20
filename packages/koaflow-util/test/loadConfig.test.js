const loadConfig = require('../lib/loadConfig');

test('config', () => {
  const config = loadConfig(`${__dirname}/__mock__/config`);

  expect(config).toEqual({
    config: true, // not index: true
  });
});

test('configDir', () => {
  const config = loadConfig(`${__dirname}/__mock__/configDir`);

  expect(config).toEqual({
    index: true,
    local: true,
  });
});

test('configDir env', () => {
  const config = loadConfig(`${__dirname}/__mock__/configDir`, 'test');

  expect(config).toEqual({
    test: true,
    local: true,
  });
});
