const Joi = require('joi');
const joiSchema = require('../validator');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

module.exports = {
	paramId: joiSchema.middleware(paramId),
};
