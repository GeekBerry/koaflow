const lodash = require('lodash');
const { composeFlow } = require('../../src/util');

const VERSION = '2.0';

class JsonRPCError extends Error {
  constructor(arg) {
    super();
    Object.assign(this, arg);
    if (arg instanceof Error) {
      this.message = arg.message;
      this.stack = arg.stack; // 复制调用栈, (stack 不会被设为 Object.keys)
    }
  }
}

class JsonRPCFlow {
  static concat(...jsonRPCFlowArray) {
    const jsonRPCFlow = new this();

    jsonRPCFlowArray.forEach((each, index) => {
      if (!(each instanceof JsonRPCFlow)) {
        throw new Error(`element ${index} not instanceof JsonRPCFlow`);
      }

      lodash.forEach(each.methods, (flow, method) => {
        if (Reflect.has(jsonRPCFlow.methods, method)) {
          throw new Error(`already exist method "${method}"`);
        }

        jsonRPCFlow.methods[method] = flow;
      });
    });

    return jsonRPCFlow;
  }

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

  flow(method) {
    const jsonRPCFlow = this;

    return async function (arg, next, end) {
      const data = { jsonrpc: VERSION, id: lodash.get(this, 'id'), method, params: [arg] };

      const { error, result } = await jsonRPCFlow.call(this, data, next, end);

      if (error) {
        throw error;
      }
      return result;
    };
  }

  /**
   * @param ctx {object} - Koa context instance
   * @param data {object|object[]}
   * @param next {function}
   * @param end {function}
   * @return {Promise<object>}
   */
  call(ctx, data, next, end) {
    const func = this.bind(ctx);

    return Array.isArray(data)
      ? Promise.all(data.map(d => func(d, next, end)))
      : func(data, next, end);
  }

  bind(ctx) {
    return async (data, next, end) => {
      if (!lodash.isPlainObject(data)) {
        const error = new JsonRPCError({ code: -32700, message: `Parse error "${data}" not a plain object` });
        return { jsonrpc: VERSION, id: null, error };
      }

      const { jsonrpc, id, method, params = [] } = data;
      if (jsonrpc !== VERSION) {
        const error = new JsonRPCError({ code: -32600, message: `Invalid request jsonrpc "${jsonrpc}"` });
        return { jsonrpc: VERSION, id, error };
      }

      const flow = this.methods[method];
      if (!flow) {
        const error = new JsonRPCError({ code: -32601, message: `Method not found "${method}"` });
        return { jsonrpc, id, error };
      }

      if (!Array.isArray(params)) {
        const error = new JsonRPCError({ code: -32602, message: `Invalid params ${JSON.stringify(params)}` });
        return { jsonrpc, id, error };
      }

      // XXX: new JsonRPCError({ code: -32603, message: 'Internal error' });

      try {
        const context = { ...ctx, jsonrpc, id, method, params };
        const result = await flow.call(context, params, next, end);
        return { jsonrpc, id, result };
      } catch (e) {
        const error = new JsonRPCError(e);
        error.code = e.code || -32000;
        error.message = e.message || 'Server error';
        return { jsonrpc, id, error };
      }
    };
  }
}

module.exports = JsonRPCFlow;
module.exports.JsonRPCError = JsonRPCError;
