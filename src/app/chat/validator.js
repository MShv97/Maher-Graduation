const Joi = require('joi');
const { joiSchema } = require('utils');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: Joi.object({
		to: Joi.objectId().required(),
		body: Joi.string(),
	}),
	files: Joi.object({
		attachments: Joi.file({
			mimetype: Joi.string().valid('image/jpeg', 'image/png'),
			size: Joi.number()
				.integer()
				.max(1024 * 1024 * 5),
		}).max(5),
	}),
}).or('body.body', 'files.attachments');

const update = Joi.object({
	params,
	body: Joi.object({
		body: Joi.string().required(),
	}),
});

const getByCriteria = Joi.object({
	query: Joi.object({
		...joiSchema.common.getByCriteria,
		doctor: Joi.objectId(),
		customer: Joi.objectId(),
	}).xor('doctor', 'customer'),
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
