const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Country = new Schema(
	{
		name: { type: String, required: true },
		code: { type: String, required: true },
		phone: { type: String, required: true },
	},
	defaultOptions({ timestamps: false })
);

module.exports = mongoose.model('Country', Country, 'Country');
