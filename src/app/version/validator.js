const Joi = require('joi');
const { joiSchema } = require('utils');

const params = { id: Joi.string().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: Joi.object({
		version: Joi.string().required(),
		major: Joi.number().min(0).required(),
		minor: Joi.number().min(0).required(),
		patch: Joi.number().min(0).required(),
		lastCompatible: Joi.object({
			version: Joi.string().required(),
			major: Joi.number().min(0).required(),
			minor: Joi.number().min(0).required(),
			patch: Joi.number().min(0).required(),
		}),
	}),
});

const update = Joi.object({
	params,
	body: Joi.object({
		version: Joi.string().required(),
		major: Joi.number().min(0).required(),
		minor: Joi.number().min(0).required(),
		patch: Joi.number().min(0).required(),
		lastCompatible: Joi.object({
			version: Joi.string().required(),
			major: Joi.number().min(0).required(),
			minor: Joi.number().min(0).required(),
			patch: Joi.number().min(0).required(),
		}),
	}),
});

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		major: Joi.number().min(0),
		minor: Joi.number().min(0),
		patch: Joi.number().min(0),
		lastCompatibleVersion: Joi.string(),
		lastCompatibleMajor: Joi.number().min(0),
		lastCompatibleMinor: Joi.number().min(0),
		lastCompatiblePatch: Joi.number().min(0),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
