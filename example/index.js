const Koaflow = require('../');
const requestLogger = require('../middleware/requestLogger');
const jsonError = require('../middleware/jsonError');

const app = new Koaflow();

app.config = {};
app.model = require('./model');
app.logic = require('./logic')(app);

app.useFlow(
  function(ctx) {
    // this === app
    ctx.config = this.config;
    ctx.logger = console;
  },
);

app.use(requestLogger(console, { space: 2 }));
app.use(jsonError());

app.router.getFlow('/', () => 'index page');
app.router.subRouter('/api', require('./router'));

app.listen(3000);
