const { TYPES, parameter, typePicker } = require('validator-picker');
const Koaflow = require('../');

const router = new Koaflow.Router();

router.post('/',
  // function (ctx) {
  //   ctx.assert(ctx === this); // "this" is "ctx"
  // },

  parameter({
    name: { path: 'request.body', type: 'str', required: true },
    age: { path: 'request.body', type: 'integer', 'bigger than 0': v => v > 0 },
  }),

  function ({ name, age }) {
    return this.logic.create({ name, age });
  },

  function () {
    this.status = 201; // created
  },

  typePicker({
    id: Number,
    name: String,
  }),
);

router.get('/:id',
  parameter({
    id: { path: 'params', type: 'int', required: true },
  }),

  function ({ id }) {
    return this.logic.query(id);
  },

  function (user) {
    if (user === null) {
      this.throw(404, 'not found', { errcode: 10404, errmsg: 'can not find user by id' });
    }
  },

  typePicker({
    id: Number,
    name: String,
  }),
);

router.get('/',
  parameter({
    page: { path: 'query', type: TYPES.int, default: 1 },
    limit: { path: 'query', type: TYPES.int, default: 10 },
  }),

  function ({ page, limit }) {
    const offset = (page - 1) * limit;
    return this.logic.list({ limit, offset });
  },

  typePicker([
    {
      id: Number,
      name: String,
    },
  ]),
);

module.exports = router;
