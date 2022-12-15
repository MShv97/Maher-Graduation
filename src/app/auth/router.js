require('./errors');
const authenticate = require('./authenticate');
const handler = require('./handler');
const validator = require('./validator');
const router = require('express').Router();

/************************
 * @Router /api/auth    *
 ************************/

router.post('/sign-up', validator.signUp, handler.signUp);

router.post('/sign-in', validator.signIn, handler.signIn);

router.post('/otp', validator.otp, authenticate('local'), handler.otp);

router.post('/refresh-token', validator.refreshToken, handler.refreshToken);

module.exports = router;
