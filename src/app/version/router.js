require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'Version' });

/*******************************
 * @Router  /api/version       *
 *******************************/

// Mobile

router.post('/mobile/', auth('save'), validator.save, handler.save('mobile'));

router.put('/mobile/:id', auth('update'), validator.update, handler.update('mobile'));

router.delete('/mobile/:id', auth('delete'), validator.paramId, handler.delete('mobile'));

router.get('/mobile/last', handler.getLast('mobile'));

router.get('/mobile/:id', validator.paramId, handler.getById('mobile'));

router.get('/mobile/', validator.getByCriteria, handler.getByCriteria('mobile'));

// Tablet

router.post('/tablet/', auth('save'), validator.save, handler.save('tablet'));

router.put('/tablet/:id', auth('update'), validator.update, handler.update('tablet'));

router.delete('/tablet/:id', auth('delete'), validator.paramId, handler.delete('tablet'));

router.get('/tablet/last', handler.getLast('tablet'));

router.get('/tablet/:id', validator.paramId, handler.getById('tablet'));

router.get('/tablet/', validator.getByCriteria, handler.getByCriteria('tablet'));

module.exports = router;
