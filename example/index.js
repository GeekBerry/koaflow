const Koaflow = require('../');

const app = new Koaflow({
  ioLogger: console,
});

app.ctx.logic = require('./logic');
app.router.subRouter('/api', require('./router'));

app.listen(3000);
