# Koaflow

koa app extend. change koa router to flow by hide and auto call `next()`.   
对 koa 进行改造和封装, 通过对 koa router 之`next()` 的自动调用将其进行隐藏, 实现流式模式.

# Installation
`npm install koaflow`

# Usage
```javascript
const Koaflow = require('koaflow');

function logic() {
  console.log(this); // ctx
}

const app = new Koaflow({
  ioLogger: console,
});

// add some tools
app.ctx.foo = () => console.log('i am foo');

app.router.use((ctx, next) => {
  console.log('router other middleware still koa type');
  return next();
});

app.router.get('/',
  function (ctx) {
    ctx.foo();
    ctx.assert(ctx === this, 'this is ctx in router middleware');

    this.throw(560, 'asdasd', { a: 100 }); // i am foo
    return true;
  },

  logic, // bind ctx to logic !!!
);

app.listen(3000);
console.log('app listen 3000');
```
