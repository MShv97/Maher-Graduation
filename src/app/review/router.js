require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'Review' });

/*************************************
 * @Router  /api/review              *
 *************************************/

router.post('/', auth('save'), validator.save, handler.save);

router.patch('/:id', auth('update'), validator.update, handler.update);

router.delete('/:id', auth('delete'), validator.paramId, handler.delete);

router.get('/metadata', handler.metadata);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

router.get('/doctor/:id', auth('view'), validator.paramId, handler.getByDoctorId);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
