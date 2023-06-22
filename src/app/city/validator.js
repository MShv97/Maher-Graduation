const Joi = require('joi');
const { joiSchema } = require('utils');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		name: Joi.search(),
		country: Joi.objectId(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
