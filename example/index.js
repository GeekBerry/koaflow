const Koaflow = require('../');
const requestLogger = require('../middleware/requestLogger');
const jsonError = require('../middleware/jsonError');

const app = new Koaflow();

app.model = require('./model');
app.logic = require('./logic')(app);

app.use(requestLogger(console, { space: 2 }));
app.use(jsonError());

app.router.get('/', () => 'index page');
app.router.subRouter('/api', require('./router'));

app.listen(3000);
