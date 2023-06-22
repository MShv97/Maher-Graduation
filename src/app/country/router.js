const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();

/*******************************
 * @Router  /api/country       *
 *******************************/

router.get('/:id', validator.paramId, handler.getById);

router.get('/', validator.getByCriteria, handler.getByCriteria);

module.exports = router;
