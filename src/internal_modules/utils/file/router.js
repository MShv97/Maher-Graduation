require('./errors');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();

/*****************************
 * @Router /static           *
 *****************************/

router.get('/:id', validator.paramId, handler.getById);

module.exports = router;
