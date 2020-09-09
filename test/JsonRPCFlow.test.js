const JsonRPCFlow = require('../lib/flow/JsonRPCFlow');

const jsonrpc = new JsonRPCFlow();

jsonrpc.method('methodName',
  async function (params) {
    if (params.length) {
      return params;
    } else {
      throw new Error('errorMessage');
    }
  },
);

test('call', async () => {
  const result = await jsonrpc.call({
    request: {
      body: {
        jsonrpc: '2.0',
        id: 100,
        method: 'methodName',
        params: ['string', 1],
      },
    },
  });

  expect(result).toEqual({
    jsonrpc: '2.0',
    id: 100,
    result: ['string', 1],
  });
});

test('call ParseError', async () => {
  const result = await jsonrpc.call({
    request: {
      body: null,
    },
  });

  expect(result).toEqual({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32700,
      message: 'Parse error',
    },
  });
});

test('call InvalidRequestError', async () => {
  const result = await jsonrpc.call({
    request: {
      body: {
        // jsonrpc: '2.0',
        id: 100,
        method: 'methodName',
        params: ['string', 1],
      },
    },
  });

  expect(result).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: {
      code: -32600,
      message: 'Invalid request',
    },
  });
});

test('call MethodNotFound', async () => {
  const result = await jsonrpc.call({
    request: {
      body: {
        jsonrpc: '2.0',
        id: 100,
        method: 'not a method name',
        params: ['string', 1],
      },
    },
  });

  expect(result).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: {
      code: -32601,
      message: 'Method not found',
    },
  });
});

test('call InvalidParamsError', async () => {
  const result = await jsonrpc.call({
    request: {
      body: {
        jsonrpc: '2.0',
        id: 100,
        method: 'methodName',
        params: {},
      },
    },
  });

  expect(result).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: {
      code: -32602,
      message: 'Invalid params',
    },
  });
});

test('call ThrowError', async () => {
  const result = await jsonrpc.call({
    request: {
      body: {
        jsonrpc: '2.0',
        id: 100,
        method: 'methodName',
        params: [],
      },
    },
  });

  expect(result).toEqual({
    jsonrpc: '2.0',
    id: 100,
    error: {
      code: -32000,
      message: 'errorMessage',
    },
  });
});
