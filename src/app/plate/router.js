require('./errors');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();

/*******************************
 * @Router  /api/plate         *
 *******************************/

router.get('/category', validator.getCategories, handler.getCategories);

router.get('/code', validator.getCodes, handler.getCodes);

module.exports = router;
