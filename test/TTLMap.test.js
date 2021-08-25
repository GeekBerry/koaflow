const TTLMap = require('../lib/TTLMap');

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

const ttlMap = new TTLMap();

// -----------------------------------------------------------------------------
afterAll(async () => {
  ttlMap.clear();
});

test('cache', async () => {
  async function get(key) {
    return ttlMap.cache(key,
      async () => {
        await sleep(10);
        return Date.now();
      },
      { ttl: 200 },
    );
  }

  const resultA0 = await get('A');
  await sleep(100);
  const resultA100 = await get('A');
  const resultB100 = await get('B');
  await sleep(150);
  const resultA250 = await get('A');

  expect(resultA100).toEqual(resultA0);
  expect(resultB100 - resultA0 >= 100).toEqual(true);
  expect(resultA250 - resultA0 >= 250).toEqual(true);
});
