const { defaultOptions } = require('database').utils;
const Schema = require('mongoose').Schema;

module.exports = (extraFields = {}) =>
	new Schema(
		{
			_id: false,
			...extraFields,
			isActive: { type: Boolean, default: false, required: true },
		},
		defaultOptions({})
	);
