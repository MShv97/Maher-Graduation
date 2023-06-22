const Joi = require('joi');
const { joiSchema } = require('utils');
const { User } = require('../Models');
const moment = require('moment');
const _ = require('lodash');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });
const files = Joi.object({
	avatar: Joi.file({
		mimetype: Joi.string().valid('image/jpeg', 'image/png'),
		size: Joi.number()
			.integer()
			.max(1024 * 1024 * 5),
	}).max(1),
	documents: Joi.file({
		mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf'),
		size: Joi.number()
			.integer()
			.max(1024 * 1024 * 5),
	}).max(5),
}).min(1);

const update = Joi.object({
	params,
	body: Joi.object({
		firstName: Joi.string(),
		lastName: Joi.string(),
		phone: Joi.phone(),
		birthDate: Joi.date(),
		city: Joi.objectId(),
		address: Joi.string(),
		longitude: Joi.longitude(),
		latitude: Joi.latitude(),
		email: Joi.string().email(),
		password: Joi.password(),
		online: Joi.boolean(),
	}).min(1),
});

const deleteFile = Joi.object({ params: { ...params, fileId: Joi.objectId().required() } });

const getByCriteria = Joi.object({
	query: Joi.object({
		...joiSchema.common.getByCriteria,
		type: Joi.array().items(Joi.enum(User.TYPES)).single(),
		name: Joi.search(),
		firstName: Joi.search(),
		lastName: Joi.search(),
		email: Joi.search(),
		phone: Joi.search(),
		address: Joi.search(),
		isActive: Joi.boolean(),
		specialty: Joi.array().items(Joi.objectId()).single(),
		city: Joi.array().items(Joi.objectId()).single(),
		distance: Joi.number().greater(0).max(300000), // max 300 km
		longitude: Joi.longitude(),
		latitude: Joi.latitude(),
		online: Joi.boolean(),
	}).and('longitude', 'latitude', 'distance'),
});

/** Mine */
const changePassword = ({ user }) => {
	const body = { new: Joi.password().required() };
	if (user.hasPassword) body.old = Joi.string().required();
	return Joi.object({ body });
};
const uploadMineFiles = Joi.object({ files });
const deleteMineFile = Joi.object({ params: { fileId: Joi.objectId().required() } });
const updateMine = Joi.object({
	body: Joi.object({
		firstName: Joi.string(),
		lastName: Joi.string(),
		birthDate: Joi.date(),
		city: Joi.objectId(),
		address: Joi.string(),
		longitude: Joi.longitude(),
		latitude: Joi.latitude(),
		phone: Joi.phone(),
		email: Joi.string().email(),
		online: Joi.boolean(),
		specialty: Joi.objectId(),
		about: Joi.string(),
		workingDays: Joi.object(
			moment.weekdays().reduce((acc, cur) => {
				acc[cur] = Joi.array().items(Joi.number().integer().min(0).max(47)).unique().single();
				return acc;
			}, {})
		),
	}).min(1),
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	update: joiSchema.middleware(update),
	deleteFile: joiSchema.middleware(deleteFile),
	getByCriteria: joiSchema.middleware(getByCriteria),
	/** Mine */
	updateMine: joiSchema.middleware(updateMine),
	uploadMineFiles: joiSchema.middleware(uploadMineFiles),
	changePassword: joiSchema.middleware(changePassword),
	deleteMineFile: joiSchema.middleware(deleteMineFile),
};
