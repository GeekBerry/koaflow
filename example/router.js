const { TYPES, parameter, typePicker } = require('validator-picker');
const Koaflow = require('../');

const router = new Koaflow.Router();

router.postFlow('/',
  function(ctx) {
    ctx.assert(ctx === this); // "this" is "ctx"
  },

  parameter({
    name: { path: 'request.body', type: 'str', required: true },
    age: { path: 'request.body', type: 'integer', 'bigger than 0': v => v > 0 },
  }),

  function({ name, age }) {
    return this.app.logic.create({ name, age });
  },

  function() {
    this.status = 201; // created
  },

  typePicker({
    id: Number,
    name: String,
  }),
);

router.getFlow('/:id',
  parameter({
    id: { path: 'params', type: 'int', required: true },
  }),

  function({ id }) {
    return this.app.logic.query(id);
  },

  function(user) {
    if (user === null) {
      this.throw(404, 'not found', { errcode: 10404, errmsg: 'can not find user by id' });
    }
  },

  typePicker({
    id: Number,
    name: String,
  }),
);

router.getFlow('/',
  parameter({
    page: { path: 'query', type: TYPES.int, default: 1 },
    limit: { path: 'query', type: TYPES.int, default: 10 },
  }),

  function({ page, limit }) {
    const offset = (page - 1) * limit;
    return this.app.logic.list({ limit, offset });
  },

  typePicker([
    {
      id: Number,
      name: String,
    },
  ]),
);

const TestError = Koaflow.Error.extend('TEST', { code: 9999 });

router.deleteFlow('/:id',
  function(ctx) {
    ctx.logger.info('NOT_ALLOWED_DELETE');
    throw new TestError('not allowed delete');
  },
);

module.exports = router;
