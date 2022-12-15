const Joi = require('joi');
const { joiSchema } = require('utils');
const { User } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });
const files = {
	icon: Joi.file({
		mimetype: Joi.string().valid('image/jpeg', 'image/png'),
		size: Joi.number()
			.integer()
			.max(1024 * 1024 * 5),
	}).max(1),
};

const save = Joi.object({
	files,
	body: Joi.object({ name: Joi.string().required() }),
});

const update = Joi.object({
	params,
	files,
	body: Joi.object({ name: Joi.string() }),
});

const deleteFile = Joi.object({ params: { ...params, fileId: Joi.objectId().required() } });

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		name: Joi.search(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	deleteFile: joiSchema.middleware(deleteFile),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
