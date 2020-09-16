const lodash = require('lodash');
const { composeFlow } = require('../../src/util');

const VERSION = '2.0';

class JsonRPCFlow {
  constructor() {
    this._methodToCallback = {};
  }

  /**
   * @param method {string}
   * @param flowArray {function[]}
   */
  method(method, ...flowArray) {
    if (Reflect.has(this._methodToCallback, method)) {
      throw new Error(`already exist method "${method}"`);
    }
    this._methodToCallback[method] = composeFlow(flowArray);
  }

  /**
   * @param other {JsonRPCFlow}
   */
  merge(other) {
    if (!(other instanceof this.constructor)) {
      throw new Error(`other must be instance of "${this.constructor.name}"`);
    }

    lodash.forEach(other._methodToCallback, (flow, method) => {
      if (Reflect.has(this._methodToCallback, method)) {
        throw new Error(`already exist method "${method}"`);
      }
      this._methodToCallback[method] = flow;
    });
  }

  async call(ctx) {
    const { request: { body } } = ctx;

    try {
      return Array.isArray(body)
        ? await Promise.all(body.map(data => this.callback(ctx, data)))
        : await this.callback(ctx, body);
    } catch (e) {
      return { jsonrpc: VERSION, id: null, error: { code: -32603, message: 'Internal error' } };
    }
  }

  async callback(ctx, data) {
    if (!lodash.isPlainObject(data)) {
      return { jsonrpc: VERSION, id: null, error: { code: -32700, message: 'Parse error' } };
    }

    const { jsonrpc, id, method, params = [] } = data;
    if (jsonrpc !== VERSION) {
      return { jsonrpc: VERSION, id, error: { code: -32600, message: `Invalid request jsonrpc "${jsonrpc}"` } };
    }

    if (!Array.isArray(params)) {
      return { jsonrpc: VERSION, id, error: { code: -32602, message: `Invalid params ${JSON.stringify(params)}` } };
    }

    const callback = this._methodToCallback[method];
    if (!lodash.isFunction(callback)) {
      return { jsonrpc, id, error: { code: -32601, message: `Method not found "${method}"` } };
    }

    try {
      const result = await callback.call(ctx, params);
      return { jsonrpc, id, result };
    } catch (e) {
      return { jsonrpc, id, error: { code: e.code || -32000, message: e.message || 'Server error' } };
    }
  }
}

module.exports = JsonRPCFlow;
