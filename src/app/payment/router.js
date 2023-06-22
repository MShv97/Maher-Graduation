require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'Payment' });

/***********************
 * @Router   /payment  *
 ***********************/

router.post('/webhook', handler.webHook);

router.get('/metadata', handler.metadata);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

module.exports = router;
