const Koaflow = require('../index');
const type = require('../lib/type');
const parameter = require('../lib/parameter');
const OpenAPI = require('../lib/OpenAPI');

const router = new Koaflow.Router();

const openAPI = new OpenAPI({
  info: {
    version: 'v0.0.0',
    description: 'example app',
    title: 'koaflow',
  },
  servers: [
    {
      url: 'https://127.0.0.1/api',
      description: 'local',
    },
  ],
});

// --------------------------------- OpenAPI ----------------------------------
router.get('/openapi', () => openAPI.toObject());

router.post('/:id',
  parameter({
    id: { path: 'param', type: type.int, default: 0 },
    name: { path: 'request.body', type: type.str, required: true },
    age: { path: 'request.body', type: type.int, required: true },
  }),

  function (options) {
    const {
      app: { service },
    } = this;

    return service.create(options);
  },
);

router.get('/:id',
  OpenAPI.flow({
    tags: ['api'],
    input: {
      id: { in: 'path', type: 'integer', required: true, minimum: 0, maximum: 10, default: 0 },
    },
    output: {
      200: {
        id: 'integer',
        name: 'string',
        age: 'integer',
      },
      500: {
        code: 'integer',
        message: 'string',
      },
    },
  }),

  parameter({
    id: { path: 'param', type: type.int, default: 0 },
  }),

  function ({ id }) {
    const {
      app: { service },
    } = this;

    return service.query(id);
  },
);

openAPI.loadRouter(router);

module.exports = router;
