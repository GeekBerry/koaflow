const lodash = require('lodash');
const Router = require('../../src/router');

const VERSION = '2.0';

class JsonRPCRouter extends Router {
  constructor(...args) {
    super(...args);
    this.methodToCallback = {};

    this.post('/', async (ctx) => {
      const { request: { body } } = ctx;

      try {
        return !Array.isArray(body) ? await this.onRequest(body) : await Promise.all(body.map(data => this.onRequest(data)));
      } catch (e) {
        return { jsonrpc: VERSION, id: null, error: { code: -32603, message: 'Internal error' } };
      }
    });
  }

  method(method, callback) {
    if (Reflect.has(this.methodToCallback, method)) {
      throw new Error(`already exist method "${method}"`);
    }
    this.methodToCallback[method] = callback;
  }

  async onRequest(data) {
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
      const result = await callback(...params);
      return { jsonrpc, id, result };
    } catch (e) {
      return { jsonrpc, id, error: { code: e.code || -32000, message: e.message || 'Server error' } };
    }
  }
}

module.exports = JsonRPCRouter;
