const lodash = require('lodash');
const { composeFlow } = require('../../src/util');

const VERSION = '2.0';

class JsonRPCFlow {
  constructor() {
    this.methods = {};
  }

  /**
   * @param method {string}
   * @param flowArray {function}
   */
  method(method, ...flowArray) {
    if (Reflect.has(this.methods, method)) {
      throw new Error(`already exist method "${method}"`);
    }
    this.methods[method] = composeFlow(flowArray);
  }

  /**
   * `callable` as flow middleware
   * @param ctx {object} - Koa context instance
   * @return {Promise<object>}
   */
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

    const flow = this.methods[method];
    if (!lodash.isFunction(flow)) {
      return { jsonrpc, id, error: { code: -32601, message: `Method not found "${method}"` } };
    }

    try {
      const result = await flow.call(ctx, params);
      return { jsonrpc, id, result };
    } catch (e) {
      return { jsonrpc, id, error: { code: e.code || -32000, message: e.message || 'Server error' } };
    }
  }
}

module.exports = JsonRPCFlow;
