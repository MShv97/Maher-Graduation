const { jwt } = require('config-keys');
const { Exception } = require('utils');
const { Session, User } = require('../Models');
const UserService = require('../user/service');
const SMSService = require('../sms/service');
const JWT = require('jsonwebtoken');
const mongoose = require('mongoose');
const moment = require('moment');

class AuthService {
	static async signUp(data) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const user = await new UserService(data).create(null, session);
			result = await this.getTokens(user, session);
			await SMSService.sendVerify(user, session);
		});
		return { data: result };
	}

	static async signIn(data) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const user = await User.findOne(data, 'email phone', { lean: true, session });
			if (!user) throw Exception.user.Not_Found;
			if (data.phone) return SMSService.sendVerify(user, session);
			// if (data.email) return EmailService.sendVerify(user, session);
		});
	}

	static async otp(user) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([
				this.getTokens(user, session),
				User.updateOne({ _id: user.id }, { lastLogin: user.lastLogin }, { session }),
			]);
		});

		return { data: result };
	}

	static async refreshToken(data) {
		let result, accessToken;
		const session = await Session.startSession();
		await session.withTransaction(async (session) => {
			const { id: _id } = JWT.verify(data.token, jwt.refreshToken.key, (err, payload) => {
				if (err) throw Exception.auth.Invalid_Refresh_Token;
				return payload;
			});

			result = await Session.findOne({ user: _id, token: data.token }).session(session);
			if (!result) throw Exception.auth.Invalid_Refresh_Token;

			const { expirationDuration, expirationUnit } = jwt.refreshToken;
			const now = new Date();
			if (moment(result.createdAt).add(expirationDuration, expirationUnit).isBefore(now)) {
				await result.delete({ session: null }); // out of session
				throw Exception.auth.Refresh_Token_Expired;
			}

			accessToken = this.getAccessToken({ id: _id });
			const passed = now - result.createdAt;
			const remaining = moment(result.createdAt).add(expirationDuration, expirationUnit) - now;
			const percentage = (passed / remaining) * 100;
			if (percentage >= 13) await result.update({ createdAt: new Date() }, { session });
		});

		return { data: { accessToken, refreshToken: result.token } };
	}

	static async getTokens(user, session) {
		const result = {};
		result.accessToken = this.getAccessToken(user);
		result.refreshToken = JWT.sign({ id: user.id }, jwt.refreshToken.key);
		const refresh = await Session.findOneAndUpdate({ user: user.id }, { createdAt: new Date() }).session(session);
		if (refresh) result.refreshToken = refresh.token;
		else {
			result.refreshToken = JWT.sign({ id: user.id }, jwt.refreshToken.key);
			await new Session({ user: user.id, token: result.refreshToken }).save({ session });
		}
		return result;
	}

	static getAccessToken(user) {
		return JWT.sign({ id: user.id }, jwt.accessToken.key, { expiresIn: jwt.accessToken.expirationDuration });
	}
}

module.exports = AuthService;
