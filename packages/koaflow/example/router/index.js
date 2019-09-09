const { Router } = require('../../index');

const router = new Router();

router.getFlow('/', () => 'index page');
router.subRouter('/user', require('./user'));

module.exports = router;
