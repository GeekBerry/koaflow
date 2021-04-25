const JsonRPCFlow = require('../lib/flow/JsonRPCFlow');

const jsonrpc = new JsonRPCFlow();

jsonrpc.method('methodName', async (params) => {
  if (!params[0]) {
    throw new Error('errorMessage');
  }
  return params;
});

test('concat', async () => {
  const jsonrpc1 = new JsonRPCFlow();
  jsonrpc1.method('a', () => 'A');

  const jsonrpc2 = new JsonRPCFlow();
  jsonrpc2.method('b', () => 'B');

  const jsonrpc3 = new JsonRPCFlow();
  jsonrpc3.method('b', () => 'B');

  const concat = JsonRPCFlow.concat(jsonrpc1, jsonrpc2);
  expect(await concat.methods.a()).toEqual('A');
  expect(await concat.methods.b()).toEqual('B');

  expect(() => JsonRPCFlow.concat(jsonrpc2, () => undefined)).toThrow('not instanceof JsonRPCFlow');
  expect(() => JsonRPCFlow.concat(jsonrpc2, jsonrpc3)).toThrow('already exist method');
});

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

test('flow', async () => {
  const flow = jsonrpc.flow('methodName');

  const result = await flow({ a: 1 });

  expect(result).toEqual([{ a: 1 }]);
});

test('flow Error', async () => {
  const flow = jsonrpc.flow('methodName');

  const error = await flow().catch(e => e);

  expect(error).toEqual(new JsonRPCFlow.JsonRPCError({
    code: -32000,
    message: 'errorMessage',
  }));
});
