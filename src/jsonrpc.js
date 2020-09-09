const lodash = require('lodash');
const Router = require('./router');
const { composeFlow } = require('./util');

const VERSION = '2.0';

class JsonRPCRouter extends Router {
  constructor(...args) {
    super(...args);
    this.methodToCallback = {};

    this.post('/', async (ctx) => {
      const { request: { body } } = ctx;

      try {
        return Array.isArray(body)
          ? await Promise.all(body.map(data => this._onRequest(ctx, data)))
          : await this._onRequest(ctx, body);
      } catch (e) {
        return { jsonrpc: VERSION, id: null, error: { code: -32603, message: 'Internal error' } };
      }
    });
  }

  method(method, ...flowArray) {
    if (Reflect.has(this.methodToCallback, method)) {
      throw new Error(`already exist method "${method}"`);
    }
    this.methodToCallback[method] = composeFlow(flowArray);
  }

  async _onRequest(ctx, data) {
    if (!lodash.isPlainObject(data)) {
      return { jsonrpc: VERSION, id: null, error: { code: -32700, message: 'Parse error' } };
    }

    const { jsonrpc, id, method, params = [] } = data;
    if (jsonrpc !== VERSION) {
      return { jsonrpc: VERSION, id, error: { code: -32600, message: 'Invalid request' } };
    }

    if (!Array.isArray(params)) {
      return { jsonrpc: VERSION, id, error: { code: -32602, message: 'Invalid params' } };
    }

    const callback = this.methodToCallback[method];
    if (!lodash.isFunction(callback)) {
      return { jsonrpc, id, error: { code: -32601, message: 'Method not found' } };
    }

    try {
      const result = await callback.call(ctx, params);
      return { jsonrpc, id, result };
    } catch (e) {
      return { jsonrpc, id, error: { code: e.code || -32000, message: e.message || 'Server error' } };
    }
  }
}

module.exports = JsonRPCRouter;
