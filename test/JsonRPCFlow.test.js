const JsonRPCFlow = require('../lib/flow/JsonRPCFlow');

const jsonrpc = new JsonRPCFlow();

jsonrpc.method('methodName',
  async function (params) {
    if (!params[0]) {
      throw new Error('errorMessage');
    }
    return params;
  },
);

test('call', async () => {
  const data = await jsonrpc.call({}, {
    jsonrpc: '2.0',
    id: 100,
    method: 'methodName',
    params: ['string', 1],
  });

  expect(data).toEqual({
    jsonrpc: '2.0',
    id: 100,
    result: ['string', 1],
  });
});

test('call ParseError', async () => {
  const data = await jsonrpc.call({}, null);

  expect(data).toEqual({
    jsonrpc: '2.0',
    id: null,
    error: new JsonRPCFlow.JsonRPCError({
      code: -32700,
      message: 'Parse error "null" not a plain object',
    }),
  });
});

test('call InvalidRequestError', async () => {
  const data = await jsonrpc.call({}, {
    // jsonrpc: '2.0',
    id: 100,
    method: 'methodName',
    params: ['string', 1],
  });

  expect(data).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: new JsonRPCFlow.JsonRPCError({
      code: -32600,
      message: 'Invalid request jsonrpc "undefined"',
    }),
  });
});

test('call MethodNotFound', async () => {
  const data = await jsonrpc.call({}, {
    jsonrpc: '2.0',
    id: 100,
    method: 'XXX',
    params: ['string', 1],
  });

  expect(data).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: new JsonRPCFlow.JsonRPCError({
      code: -32601,
      message: 'Method not found "XXX"',
    }),
  });
});

test('call InvalidParamsError', async () => {
  const data = await jsonrpc.call({}, {
    jsonrpc: '2.0',
    id: 100,
    method: 'methodName',
    params: {},
  });

  expect(data).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: new JsonRPCFlow.JsonRPCError({
      code: -32602,
      message: 'Invalid params {}',
    }),
  });
});

test('call ThrowError', async () => {
  const data = await jsonrpc.call({}, {
    jsonrpc: '2.0',
    id: 100,
    method: 'methodName',
    params: [],
  });

  expect(data).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: new JsonRPCFlow.JsonRPCError({
      code: -32000,
      message: 'errorMessage',
    }),
  });
});

test('methodFlow', async () => {
  const flow = jsonrpc.methodFlow('methodName');

  const result = await flow({ a: 1 });

  expect(result).toEqual([{ a: 1 }]);
});

test('methodFlow Error', async () => {
  const flow = jsonrpc.methodFlow('methodName');

  const error = await flow().catch(e => e);

  expect(error).toEqual(new JsonRPCFlow.JsonRPCError({
    code: -32000,
    message: 'errorMessage',
  }));
});
