const Joi = require('joi');
const { joiSchema } = require('utils');
const { Appointment } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: {
		type: Joi.enum(Appointment.TYPES).required(),
		doctor: Joi.objectId().required(),
		date: Joi.date().required(),
		time: Joi.number().integer().min(0).max(47).required(),
	},
});

const update = Joi.object({
	params,
	body: Joi.object({
		type: Joi.enum(Appointment.TYPES),
		doctor: Joi.objectId(),
		date: Joi.date(),
		time: Joi.number().integer().min(0).max(47),
	}).min(1),
});

const getOccupations = Joi.object({
	query: {
		doctor: Joi.objectId().required(),
		from: Joi.date().required(),
		to: Joi.date(),
	},
});

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		status: Joi.array().items(Joi.enum(Appointment.STATUSES)).single(),
		type: Joi.array().items(Joi.enum(Appointment.TYPES)).single(),
		doctor: Joi.array().items(Joi.objectId()).single(),
		from: Joi.date(),
		to: Joi.date(),
		time: Joi.array().items(Joi.number().integer().min(0).max(47)).single(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	getOccupations: joiSchema.middleware(getOccupations),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
