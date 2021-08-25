const TimerMap = require('../lib/TimerMap');

async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

const timerMap = new TimerMap();

// -----------------------------------------------------------------------------
afterAll(async () => {
  timerMap.clear();
});

test('set duplicate', async () => {
  const startTimestamp = Date.now();
  let endTimestamp1;
  let endTimestamp2;
  let count = 0;

  timerMap.set('a', 100, () => {
    endTimestamp1 = Date.now();
    count += 1;
  });

  await sleep(50);

  timerMap.set('a', 100, () => {
    endTimestamp2 = Date.now();
    count += 1;
  });

  await sleep(500);

  expect(count).toEqual(1);
  expect(endTimestamp1).toEqual(undefined);
  expect(endTimestamp2 - startTimestamp > 150).toEqual(true);
});

test('delete', async () => {
  let timestamp;
  let count = 0;

  timerMap.set('a', 100, () => {
    timestamp = Date.now();
    count += 1;
  });

  await sleep(50);

  timerMap.delete('a');

  await sleep(500);

  expect(count).toEqual(0);
  expect(timestamp).toEqual(undefined);
});

test('clear', async () => {
  let timestamp;
  let count = 0;

  timerMap.set('a', 100, () => {
    timestamp = Date.now();
    count += 1;
  });

  await sleep(50);

  timerMap.clear();

  await sleep(500);

  expect(count).toEqual(0);
  expect(timestamp).toEqual(undefined);
});
