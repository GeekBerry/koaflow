const lodash = require('lodash');
const LockSet = require('../lib/LockSet');

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

const lockSet = new LockSet();

// -----------------------------------------------------------------------------
test('add', async () => {
  let locked = 0;
  let unlocked = 0;

  async function inc() {
    await lockSet.lock('inc', async () => {
      const value = locked;
      await sleep(Math.random() * 100);
      locked = value + 1;
    });

    const value = unlocked;
    await sleep(Math.random() * 100);
    unlocked = value + 1;
  }

  await Promise.all(lodash.range(10).map(() => inc()));

  expect(locked).toEqual(10);
  expect(unlocked).not.toEqual(10);
});
