const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Specialty = new Schema(
	{
		name: { type: String, required: true },
		icon: { type: Schema.Types.ObjectId, ref: 'File' },
	},
	defaultOptions({ timestamps: false })
);

Specialty.statics = {};

module.exports = mongoose.model('Specialty', Specialty, 'Specialty');
