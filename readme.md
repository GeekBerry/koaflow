# Koaflow

koa app extend. change koa router to flow by hide and auto call `next()`.   
对 koa 进行改造和封装, 通过对 koa router 之`next()` 的自动调用将其进行隐藏, 实现流式模式.

# Installation
`npm install koaflow`

# Usage

* app.js

```javascript
const Koaflow = require('koaflow');

const app = new Koaflow({
  ioLogger: console,
});

app.ctx.logic = require('./logic');
app.router.subRouter('/api', require('./router'));

app.listen(3000);

console.log('app listen 3000');
```

* router.js

```javascript
const { TYPES, parameter, typePicker } = require('validator-picker');
const Koaflow = require('koaflow');

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
```

* logic

```javascript
const model = require('./model');

function create({ name, age }) {
  return model.create({ name, age });
}

function query(id) {
  return model.findById(id);
}

function list({ limit, offset }) {
  return model.find({ limit, offset });
}

module.exports = {
  create,
  query,
  list,
};
```

* model

```javascript
const model = {
  async create({ name, age }) {
    return { id: 1, name, age, _v: 1 };
  },

  async findById(userId) {
    if (userId === 1) {
      return { id: 1, name: 'Tom', age: 18, _v: 1 };
    } else {
      return null;
    }
  },

  async find({ limit, offset }) {
    // limit, offset ...
    return [
      { id: 1, name: 'Tom', age: 18, _v: 1 },
      { id: 2, name: 'Jerry', age: null, _v: 1 },
    ];
  },
};

module.exports = model;
```
