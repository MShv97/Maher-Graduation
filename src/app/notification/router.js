require('./abilities') && require('./errors');
const { authorization } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action, opt = {}) => authorization({ action, subject: 'Notification', ...opt });
const options = { nonVerified: true, nonActive: true };

/********************************
 * @Router  /api/notification   *
 ********************************/

router.post('/', auth('save', options), validator.save, handler.save);

router.post('/subscribe', auth('subscribe', options), validator.subscribe, handler.subscribe);

router.patch('/mark-as-read', auth('mark-as-read', options), validator.markAsRead, handler.markAsRead);

router.get('/metadata', handler.metadata);

router.get('/:id', auth('view', options), validator.paramId, handler.getById);

router.get('/', auth('view', options), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
