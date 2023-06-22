const Joi = require('joi');
const { joiSchema } = require('utils');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: Joi.object({
		doctor: Joi.objectId().required(),
		stars: Joi.number().integer().min(0).max(10).required(),
		comment: Joi.string().required(),
	}),
});

const update = Joi.object({
	params,
	body: Joi.object({
		stars: Joi.number().integer().min(0).max(10).required(),
		comment: Joi.string().required(),
	}),
});

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		doctor: Joi.objectId(),
		customer: Joi.objectId(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
