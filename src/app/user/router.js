require('./abilities') && require('./errors');
const { authorization, multerUpload } = require('utils');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();
const auth = (action, opt = {}) => authorization({ action, subject: 'User', ...opt });
const upload = multerUpload('avatar', 'documents');
const options = { nonVerified: true, nonActive: true, strict: false, isProfileComplete: false };

/************************
 * @Router  /api/user   *
 ************************/

/****** Mine  ********/

router.patch('/mine', auth('update-mine', options), validator.updateMine, handler.updateMine);

router.patch('/mine/file', auth('update-mine', options), upload, validator.uploadMineFiles, handler.uploadMineFiles);

router.patch('/password', auth('password', options), validator.changePassword, handler.changePassword);

router.delete('/mine/:fileId', auth('update-mine', options), validator.deleteMineFile, handler.deleteMineFile);

router.get('/mine', auth('view-mine', options), handler.getMine);

/******* Admin ********/

router.post('/:id/activate', auth('activate'), validator.paramId, handler.activate(true));

router.post('/:id/deactivate', auth('activate'), validator.paramId, handler.activate(false));

router.patch('/:id', auth('update'), validator.update, handler.update);

router.delete('/:id/:fileId', auth('update'), validator.deleteFile, handler.deleteFile);

router.delete('/:id', auth('delete'), validator.paramId, handler.delete);

router.get('/metadata', handler.metadata);

router.get('/:id', auth('view'), validator.paramId, handler.getById);

router.get('/', auth('view'), validator.getByCriteria, handler.getByCriteria);

module.exports = router;
