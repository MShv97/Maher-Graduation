const Joi = require('joi');
const { joiSchema } = require('utils');
const { Payment, User } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const getByCriteria = (user) => {
	const query = {
		...joiSchema.common.getByCriteria,
		status: Joi.array().items(Joi.enum(Payment.STATUSES)).single(),
		resource: Joi.objectId(),
		resourceType: Joi.array().items(Joi.enum(Payment.RESOURCE_TYPES)).single(),
		type: Joi.enum(Payment.TYPES),
		amount: Joi.comparison(),
		from: Joi.date(),
		to: Joi.date(),
	};

	if (user.type === User.TYPES.SYSTEM) {
		query['user'] = Joi.objectId();
	}

	return Joi.object({ query });
};

module.exports = {
	paramId: joiSchema.middleware(paramId),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
