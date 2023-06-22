const { jwt, local } = require('./strategies');
const passport = require('passport');

passport.use('local', local);

passport.use('jwt', jwt);

module.exports = passport;
