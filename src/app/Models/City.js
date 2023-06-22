const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const City = new Schema(
	{
		country: { type: Schema.Types.ObjectId, ref: 'Country', select: false, required: true },
		name: { type: String, required: true },
	},
	defaultOptions({ timestamps: false })
);

module.exports = mongoose.model('City', City, 'City');
