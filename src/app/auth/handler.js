const { httpStatus } = require('utils');
const AuthService = require('./service');

module.exports = {
	signUp: async (req, res) => {
		const { body: data } = req;
		await AuthService.signUp(data);
		res.sendStatus(httpStatus.CREATED);
	},

	signIn: async (req, res) => {
		const { body: data } = req;
		await AuthService.signIn(data);
		res.sendStatus(httpStatus.OK);
	},

	otp: async (req, res) => {
		const { user } = req;
		const result = await AuthService.otp(user);
		res.status(httpStatus.OK).json(result);
	},

	refreshToken: async (req, res) => {
		const { body: data } = req;
		const result = await AuthService.refreshToken(data);
		res.status(httpStatus.UPDATED).json(result);
	},
};
