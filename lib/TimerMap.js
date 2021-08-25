class TimerMap extends Map {
  set(key, ttl, callback) {
    this.delete(key);

    const timerId = setTimeout(() => {
      this.delete(key);
      return callback();
    }, ttl);
    super.set(key, timerId);
  }

  delete(key) {
    clearTimeout(this.get(key)); // clearTimeout accept undefined
    super.delete(key);
  }

  clear() {
    for (const timerId of this.values()) {
      clearTimeout(timerId);
    }
    super.clear();
  }
}

module.exports = TimerMap;
