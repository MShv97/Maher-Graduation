require('./abilities') && require('./errors');
const { authorization, multerUpload } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'Chat' });
const upload = multerUpload('attachments');

/*************************************
 * @Router  /api/chat              *
 *************************************/

router.post('/', auth('save'), upload, validator.save, handler.save);

router.patch('/:id', auth('update'), validator.update, handler.update);

router.delete('/:id', auth('delete'), validator.paramId, handler.delete);

router.get('/metadata', handler.metadata);

router.get('/records', auth('view'), validator.getRecordsByCriteria, handler.getRecordsByCriteria);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
