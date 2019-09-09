const type = require('koaflow-type');
const picker = require('koaflow-picker');
const { Router } = require('../../index');

const router = new Router();

router.getFlow('/:id',
  type({
    id: { path: 'param', type: type.int, default: 0 },
  }),

  function({ id }) {
    const { service } = this;
    return service.user.query({ id });
  },

  picker({
    name: String,
    age: Number,
  }),
);

router.postFlow('/',
  type({
    id: { path: 'request.body', type: type.mongoId, required: true },
    name: { path: 'request.body', type: type.str, required: true },
    age: { path: 'request.body', type: type.integer, default: 18 },
  }),

  function({ name, age }) {
    const { service } = this;
    return service.user.create({ name, age });
  },
);

module.exports = router;
