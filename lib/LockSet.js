class LockSet extends Set {
  async add(key, { delay = 0 } = {}) {
    while (this.has(key)) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return super.add(key);
  }

  async lock(key, func, options) {
    try {
      await this.add(key, options);
      return await func();
    } finally {
      this.delete(key);
    }
  }
}

module.exports = LockSet;
