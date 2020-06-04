const Koaflow = require('../index');
const type = require('../lib/type');
const parameter = require('../lib/parameter');

const router = new Koaflow.Router();

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

module.exports = router;
