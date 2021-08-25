/**
 * limited concurrence decorator
 *
 * @param func {function} - function to be decorate
 * @param [limit=Infinity] {number} - concurrence number
 * @param [length=Infinity] {number} - max queue (in event loop) length
 * @param [delta=0] {number} - wait in loop time
 * @return {function} : decorated function
 */
function limitConcurrence(func, {
  limit = Infinity,
  length = Infinity,
  delta = 0,
} = {}) {
  let queueLength = 0;
  let concurrence = 0;
  return async function (...args) {
    queueLength += 1;
    if (!(queueLength <= length)) {
      throw new Error(`limitConcurrence queue length ${queueLength} over max length ${length}`);
    }
    while (concurrence >= limit) {
      await new Promise(resolve => setTimeout(resolve, delta));
    }
    queueLength -= 1;

    try {
      concurrence += 1;
      return await func.call(this, ...args);
    } finally {
      concurrence -= 1;
    }
  };
}

module.exports = limitConcurrence;
