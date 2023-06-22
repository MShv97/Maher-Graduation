const Joi = require('joi');
const { joiSchema } = require('utils');
const { User } = require('../Models');
const _ = require('lodash');

const signUp = Joi.object({
	body: Joi.object({
		type: Joi.enum(User.TYPES).required(),
		phone: Joi.phone().required(),
	}),
});

const signIn = Joi.object({
	body: Joi.object({
		email: Joi.string().email(),
		phone: Joi.string(),
	}).xor('email', 'phone'),
});

const otp = Joi.object({
	body: Joi.object({
		email: Joi.string().email(),
		phone: Joi.string(),
		code: Joi.string(),
		password: Joi.string(),
	})
		.xor('email', 'phone')
		.xor('code', 'password')
		.nand('email', 'code'),
});

const refreshToken = Joi.object({ body: { token: Joi.string().required() } });

module.exports = {
	signUp: joiSchema.middleware(signUp),
	signIn: joiSchema.middleware(signIn),
	otp: joiSchema.middleware(otp),
	refreshToken: joiSchema.middleware(refreshToken),
};
