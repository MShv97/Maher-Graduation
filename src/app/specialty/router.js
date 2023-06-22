require('./abilities') && require('./errors');
const { authorization, multerUpload } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action) => authorization({ action, subject: 'Specialty' });
const upload = multerUpload('icon');

/*************************************
 * @Router  /api/specialty           *
 *************************************/

router.post('/', auth('save'), upload, validator.save, handler.save);

router.patch('/:id', auth('update'), upload, validator.update, handler.update);

router.delete('/:id/:fileId', auth('delete'), validator.deleteFile, handler.deleteFile);

router.delete('/:id', auth('delete'), validator.paramId, handler.delete);

router.get('/metadata', handler.metadata);

router.get('/:id', validator.paramId, handler.getById);

router.get('/', validator.getByCriteria, handler.getByCriteria);

module.exports = router;
