const lodash = require('lodash');
const limitConcurrence = require('../lib/limitConcurrence');

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function func() {
  await sleep(100);
}

class Class {
  constructor() {
    this.duration = 100;
  }

  async func() {
    if (!this.duration) {
      throw new Error('duration is empty');
    }
    await sleep(this.duration);
  }
}

// -----------------------------------------------------------------------------
test('limitConcurrence limit', async () => {
  const limitFunc = limitConcurrence(func, { limit: 2 });

  let timestamp;

  timestamp = Date.now();
  await Promise.all(lodash.range(10).map(func));
  expect(Date.now() - timestamp < 200).toEqual(true);

  timestamp = Date.now();
  await Promise.all(lodash.range(10).map(limitFunc));
  expect(Date.now() - timestamp > 500).toEqual(true);
});

test('limitConcurrence length', async () => {
  const limitFunc = limitConcurrence(func, { limit: 3, length: 5 });

  const timestamp = Date.now();
  await Promise.all(lodash.range(3).map(limitFunc));
  expect(Date.now() - timestamp < 400).toEqual(true);

  try {
    await Promise.all(lodash.range(10).map(() => limitFunc()));
    throw new Error('not throw');
  } catch (e) {
    expect(e.message).toMatch(/limitConcurrence queue length 6 over max length 5/);
  }
});

test('limitConcurrence method', async () => {
  let timestamp;

  const instance = new Class();

  timestamp = Date.now();
  await Promise.all(lodash.range(10).map(() => instance.func()));
  expect(Date.now() - timestamp < 200).toEqual(true);

  instance.func = limitConcurrence(instance.func, { limit: 2 });

  timestamp = Date.now();
  await Promise.all(lodash.range(10).map(() => instance.func()));
  expect(Date.now() - timestamp > 500).toEqual(true);
});
