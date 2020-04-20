const lodash = require('lodash');

class Entry {
  constructor(key, {
    path = '',
    type: _type = v => v,
    'default': _default,
    required = false,
    ...conditions
  }) {
    if (!lodash.every(conditions, lodash.isFunction)) {
      throw new Error(`not every conditions [${Object.keys(conditions).join(',')}] are function`);
    }

    this.key = key;
    this.path = path;
    this.type = _type;
    this.default = lodash.isFunction(_default) ? _default : () => _default;
    this.required = lodash.isFunction(required) ? required : () => required;
    this.condition = function (value, dist) {
      lodash.forEach(conditions, (condition, name) => {
        if (!condition(value, dist)) {
          throw new Error(`do not match condition "${name}", got: ${value}`);
        }
      });
    };
  }

  pick(src, dist) {
    const path = this.path ? `${this.path}.${this.key}` : this.key;

    // 检查已验证过的参数
    let value = lodash.get(dist, path);

    // 检查原始参数
    if (value === undefined) {
      value = lodash.get(src, path);
    }

    // 检查是否必填
    if (value === undefined && this.required(dist)) {
      throw new Error(`"${path}" is required`);
    }

    // 获取默认值
    if (value === undefined) {
      value = this.default(dist);
    }

    // 没有默认值将直接返回
    if (value === undefined) {
      return undefined;
    }

    // 检查格式
    try {
      value = this.type(value);
    } catch (e) {
      throw new Error(`"${path}" ${e.message}`);
    }

    // 附加检查条件
    try {
      this.condition(value, dist);
    } catch (e) {
      throw new Error(`"${path}" ${e.message}`);
    }

    return value;
  }
}

module.exports = Entry;
