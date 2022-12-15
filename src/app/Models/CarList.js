const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarList = new Schema(
	{
		make: { type: String, required: true },
		model: { type: String, required: true },
		year: { type: Number, required: true },
		category: { type: String, required: true },
	},
	defaultOptions({ timestamps: false })
);

module.exports = mongoose.model('CarList', CarList, 'CarList');
