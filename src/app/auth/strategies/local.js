const { Exception } = require('utils');
const { User } = require('../../Models');
const { Strategy } = require('passport-custom');
const mongoose = require('mongoose');
const _ = require('lodash');

function parseError(data) {
	if (data.username) return Exception.auth.Invalid_Auth_Username_Password;
	if (data.email && data.password) return Exception.auth.Invalid_Auth_Email_Password;
	if (data.email && data.code) return Exception.auth.Invalid_Auth_Email_Code;
	if (data.phone && data.password) return Exception.auth.Invalid_Auth_Phone_Password;
	if (data.phone && data.code) return Exception.auth.Invalid_Auth_Phone_Code;
}

module.exports = new Strategy(async ({ body: data }, done) => {
	const conditions = (() => {
		const result = { ..._.pick(data, ['phone']) };

		if (data.email) result['email'] = new RegExp(`^${data.email}$`, 'i');
		if (data.username) result['username'] = new RegExp(`^${data.username}$`, 'i');

		return result;
	})();

	let user;
	const session = await mongoose.startSession();
	await session.withTransaction(async (session) => {
		user = await User.logIn(conditions, session);
		if (!user) return;
		if (data.password && (await user.verifyPassword(data.password)) !== true) return done(parseError(data));
		if (data.code && (await user.verifyCode(data, session)) !== true) return done(parseError(data));
	});

	if (!user) return done(parseError(data));
	done(null, user.toObject());
});
