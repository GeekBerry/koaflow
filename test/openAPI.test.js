const Router = require('../src/router');
const OpenAPI = require('../lib/OpenAPI');

const openAPI = new OpenAPI({
  info: {
    version: 'v1.0.0',
    title: 'app',
  },
  servers: [
    {
      url: 'http://localhost/v1',
      description: 'local',
    },
  ],
});

test('openapi', () => {
  const router = new Router();

  router.get('/user/:id',
    OpenAPI.flow({
      tags: ['user'],
      input: {
        id: { in: 'path', type: 'integer', required: true },
      },
      output: {
        200: {
          id: 'integer',
        },
        500: undefined,
      },
    }),
  );

  openAPI.loadRouter(router);

  expect(openAPI.toObject()).toEqual({
    openapi: '3.0.0',
    info: {
      version: 'v1.0.0',
      title: 'app',
    },
    servers: [
      {
        url: 'http://localhost/v1',
        description: 'local',
      },
    ],
    paths: {
      '/user/{id}': {
        get: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'integer',
              },
            },
          ],
          responses: {
            200: {
              description: '',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: '',
              content: {
                'application/json': {},
              },
            },
          },
          tags: [
            'user',
          ],
        },
      },
    },
  });
});
