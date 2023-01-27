const Joi = require('joi');
const { joiSchema } = require('utils');
const { Notification } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: {
		users: Joi.array().items(Joi.objectId()).max(100).unique().single(),
		title: Joi.string().required(),
		body: Joi.string().required(),
	},
});

const subscribe = Joi.object({ body: { token: Joi.string().required() } });

const markAsRead = Joi.object({
	body: {
		ids: Joi.array().items(Joi.objectId()).unique().single().required(),
		markedAsRead: Joi.boolean().required(),
	},
});

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		markedAsRead: Joi.boolean(),
		resource: Joi.objectId(),
		resourceModel: Joi.enum(Notification.RESOURCES_MODELS),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	subscribe: joiSchema.middleware(subscribe),
	markAsRead: joiSchema.middleware(markAsRead),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
