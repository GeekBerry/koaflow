const Koaflow = require('../index');
const loadConfig = require('../lib/util/loadConfig');
const jsonError = require('../lib/middleware/jsonError');
const requestId = require('../lib/middleware/requestId');
const requestLogger = require('../lib/middleware/requestLogger');

// ----------------------------------------------------------------------------
const Service = require('./service');
const router = require('./router');

class App extends Koaflow {
  constructor(config) {
    super();

    this.config = config;
    this.logger = console;
    this.service = new Service(this);
  }

  listen(port) {
    this.use(jsonError);
    this.use(requestLogger(this.logger));
    this.use(requestId);

    this.router.all('/', () => Date.now());
    this.router.sub('/api', router);

    return super.listen(port);
  }
}

// ----------------------------------------------------------------------------
const app = new App(loadConfig('./config'));

app.listen(3000);
