// eslint-disable-next-line max-classes-per-file
const lodash = require('lodash');
const LockSet = require('./LockSet');
const TimerMap = require('./TimerMap');

class TTLMap {
  constructor(map) {
    this.map = map || new Map();
    this.lockSet = new LockSet();
    this.timerMap = new TimerMap();
  }

  has(key) {
    return this.map.has(key);
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, value, ttl = Infinity) {
    if (ttl !== Infinity) {
      this.timerMap.set(key, ttl, () => this.delete(key));
    }
    return this.map.set(key, value);
  }

  delete(key) {
    return this.map.delete(key);
  }

  async cache(key, func, {
    ttl,
    isLoad = () => false,
    isSave = () => true,
  } = {}) {
    const getTTL = lodash.isFunction(ttl) ? ttl : () => ttl;

    return this.lockSet.lock(key, async () => {
      let value = this.get(key); // `get` first, then check `has`
      let needSave = false;

      if (!this.has(key) || await isLoad(value)) {
        value = await func();
        needSave = true;
      }

      if (needSave && await isSave(value)) {
        this.set(key, value, await getTTL(value));
      }

      return value;
    });
  }

  clear() {
    this.lockSet.clear();
    this.timerMap.clear();
    this.map.clear();
  }

  close() {
    this.lockSet.clear();
    this.timerMap.clear();
  }
}

module.exports = TTLMap;
