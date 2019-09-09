process.env.NODE_ENV = 'prod';

const App = require('../index'); // koaflow
const { LogicError, loadConfig, lazyRequire } = require('koaflow-util');
const requestLogger = require('koaflow-middleware/requestLogger');

// ============================================================================
const app = new App();

app.config = loadConfig('./config');
app.router = require('./router');

// ----------------------------------------------------------------------------
app.use(requestLogger({
  request: ['method', 'url'],
  response: ['status', 'body'],
  level: 'info',
  format: 'readable',
}));

app.catch(function(err) {
  if (!(err instanceof LogicError)) {
    app.logger.error(err);
    err = new LogicError('LogicError');
  }
  this.body = err;
});

app.use(LogicError.wrap(e => e.constructor.name === 'TypeError', { code: 1000 }));
app.use(LogicError.wrap(e => e.constructor.name === 'PickerError', { code: 9998 }));

app.then((ctx) => {
  ctx.config = app.config;
  ctx.service = lazyRequire('./service')(ctx);
  ctx.logger = app.logger;
});

app.listen(3000);
