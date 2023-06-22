require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'Appointment' });

/*************************************
 * @Router  /api/appointment          *
 *************************************/

router.post('/', auth('save'), validator.save, handler.save);

router.post('/:id/approve', auth('approve'), validator.paramId, handler.process('approve'));

router.post('/:id/cancel', auth('cancel'), validator.paramId, handler.process('cancel'));

router.post('/:id/reject', auth('reject'), validator.paramId, handler.process('reject'));

router.patch('/:id', auth('update'), validator.update, handler.update);

router.get('/metadata', handler.metadata);

router.get('/occupations', auth('occupations'), validator.getOccupations, handler.getOccupations);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
