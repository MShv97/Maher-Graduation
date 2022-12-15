const Joi = require('joi');
const { joiSchema } = require('utils');
const { User } = require('../Models');
const _ = require('lodash');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });
const files = {
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
};

const save = Joi.object({
	files: {
		...files,
		documents: files.documents.when('..body.type', { is: User.TYPES.DOCTOR, then: Joi.optional(), otherwise: Joi.forbidden() }),
	},
	body: {
		type: Joi.enum(User.TYPES).required(),
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		birthDate: Joi.date().required(),
		city: Joi.objectId().required(),
		address: Joi.string().required(),
		phone: Joi.phone().required(),
		email: Joi.string().email(),
		password: Joi.password().required(),
	},
});

const update = Joi.object({
	params,
	files,
	body: Joi.object({
		firstName: Joi.string(),
		lastName: Joi.string(),
		phone: Joi.phone(),
		birthDate: Joi.date(),
		city: Joi.objectId(),
		address: Joi.string(),
		email: Joi.string().email(),
		password: Joi.password(),
	}).min(1),
});

const deleteFile = Joi.object({ params: { ...params, fileId: Joi.objectId().required() } });

const getByCriteria = Joi.object({
	query: {
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
	},
});

/** Mine */
const changePassword = ({ user }) => {
	const body = { new: Joi.password().required() };
	if (user.hasPassword) body.old = Joi.string().required();
	return Joi.object({ body });
};
const deleteMineFile = Joi.object({ params: { fileId: Joi.objectId().required() } });
const updateMine = Joi.object({
	body: Joi.object({
		firstName: Joi.string(),
		lastName: Joi.string(),
		birthDate: Joi.date(),
		city: Joi.objectId(),
		address: Joi.string(),
		phone: Joi.phone(),
		email: Joi.string().email(),
	}).min(1),
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	deleteFile: joiSchema.middleware(deleteFile),
	getByCriteria: joiSchema.middleware(getByCriteria),
	/** Mine */
	updateMine: joiSchema.middleware(updateMine),
	changePassword: joiSchema.middleware(changePassword),
	deleteMineFile: joiSchema.middleware(deleteMineFile),
};
