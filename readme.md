# Koaflow

koa app extend. change koa router to flow by hide and auto call `next()`.   
对 koa 进行改造和封装, 通过对 koa router 之`next()` 的自动调用将其进行隐藏, 实现流式模式.

# Installation
`npm install koaflow`

# Usage
```javascript
const App = require('koaflow');

const app = new App();

const router = new App.Router();

router.get('/',
  function (ctx) {
    ctx.assert(ctx === this); // in not lambda func, 'this' is 'ctx'
    return { num: 100 };
  },

  async function ({ num }) {
    // await xxx
    if (num !== 100) {
      this.throw(500, 'num should be 100')
    }

    return { state: 'ok' };
  },
);


app.root.get('/', ctx=>{status:'ok'});
app.root.subRouter('/v1', router);

app.listen(3000);
```
