const Joi = require('joi');
const { joiSchema } = require('utils');

const getCategories = Joi.object({ query: { city: Joi.objectId().required() } });

const getCodes = Joi.object({ query: { category: Joi.objectId().required() } });

module.exports = {
	getCategories: joiSchema.middleware(getCategories),
	getCodes: joiSchema.middleware(getCodes),
};
