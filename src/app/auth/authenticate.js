const { Exception } = require('utils');
const passport = require('./passport');
const { User } = require('../Models');

module.exports =
	(strategy, options = {}) =>
	(req, res, next) => {
		passport.authenticate(strategy, function (err, user) {
			const { strict = true, nonVerified, nonActive, isProfileComplete } = options;
			if (!user) if (strict) return next(err || Exception.auth.Unauthenticated);

			req.user = user || {};
			if (!strict || strategy !== 'jwt') return next();
			if (!nonVerified && !User.isVerified(user)) return next(Exception.auth.Account_Unverified);
			if (!nonActive && !user.isActive) return next(Exception.auth.Account_Inactive);

			next();
		})(req, res, next);
	};
