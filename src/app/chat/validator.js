const Joi = require('joi');
const { joiSchema } = require('utils');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: Joi.object({
		doctor: Joi.objectId().required(),
		body: Joi.string().required(),
	}),
});

const update = Joi.object({
	params,
	body: Joi.object({
		body: Joi.string().required(),
	}),
});

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		doctor: Joi.objectId(),
		customer: Joi.objectId(),
	},
});

const getRecordsByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	getByCriteria: joiSchema.middleware(getByCriteria),
	getRecordsByCriteria: joiSchema.middleware(getRecordsByCriteria),
};
