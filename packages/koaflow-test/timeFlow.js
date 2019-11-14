const lodash = require('lodash');
const colors = require('colors/safe'); // eslint-disable-line import/no-extraneous-dependencies

class TimeFlow {
  constructor({ size = 12, length = 16, interval = 1000 } = {}) {
    this._stop = false;

    this.size = size;
    this.length = length;

    this._countArray = lodash.range(size).map(() => 0);
    this._startTimestamp = Date.now();
    this._lastTimestamp = null;

    this._drawLinesLoop(interval).catch(() => {});
  }

  _timestamp() {
    const now = Date.now();
    const total = now - this._startTimestamp;
    const delta = now - (this._lastTimestamp || now);
    this._lastTimestamp = now;
    return `[${lodash.pad(total, 8)},${lodash.pad(delta, 8)}]`;
  }

  /*
   get a cell string with `pos` back ground color
   */
  _cell(pos, str, suffix = '', color = null) {
    const empty = lodash.repeat(' ', this.length);
    str = lodash.truncate(`${str}${empty}`, { length: this.length, omission: `${suffix}` });
    str = lodash.padEnd(str, this.length, ' ');

    if (this._countArray[pos]) {
      str = colors.bgWhite(str);
    }

    if (color) {
      str = colors[color](str);
    }

    return str;
  }

  /*
   gen a array of cell string
   */
  _array(str = ' ') {
    return lodash.range(this.size).map(pos => this._cell(pos, str));
  }

  async _drawLinesLoop(interval) {
    while (!this._stop) {
      const array = this._array(lodash.repeat('.', this.length));
      console.log(`${this._timestamp()}: ${array.join(' | ')} |`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  // ------------------------------------------------------
  /*
   print a line with timestamp and full cell in `pos` with `str`
   */
  print(pos, str, suffix = '', color = null) {
    const array = this._array();
    array[pos] = this._cell(pos, str, suffix, color);
    console.log(`${this._timestamp()}: ${array.join(' | ')} |`);
  }

  /**
   * decorate function `obj[key]`, and print it time flow in flow `pos`
   * @param {number} pos: flow blockIndex
   * @param {object} obj
   * @param {string} key
   * @param {function?} name: if set, gen print string by name(...args)
   */
  trace(pos, obj, key, name = undefined) {
    const func = obj[key].bind(obj);

    obj[key] = async (...args) => {
      const str = name ? name(...args) : key;

      this._countArray[pos] += 1;
      this.print(pos, str);

      const st = Date.now();
      try {
        const ret = await func(...args);
        this.print(pos, str, Date.now() - st, 'blue');
        this._countArray[pos] -= 1;
        return ret;
      } catch (e) {
        this.print(pos, str, Date.now() - st, 'red');
        this._countArray[pos] -= 1;
        throw e;
      }
    };
  }

  close() {
    this._stop = true;
  }
}

module.exports = TimeFlow;
