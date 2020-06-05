const lodash = require('lodash');

class Entry {
  constructor(key, {
    path = '',
    type: _type = v => v,
    'default': _default,
    required = false,
    enum: _enum,
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
    this.enum = _enum ? new Set(_enum) : undefined;
    this.conditions = conditions;
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

    if (this.enum && !this.enum.has(value)) {
      throw new Error(`"${path}" do not match enum {${[...this.enum].join(',')}}`);
    }

    // 附加检查条件
    for (const [name, func] of Object.entries(this.conditions)) {
      if (!func(value, dist)) {
        throw new Error(`"${path}" do not match condition "${name}", got: ${value}`);
      }
    }

    return value;
  }
}

module.exports = Entry;
