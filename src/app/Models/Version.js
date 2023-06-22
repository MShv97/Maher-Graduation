const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;

const Version = new Schema(
	{
		version: { type: String, required: true },
		major: { type: Number, required: true },
		minor: { type: Number, required: true },
		patch: { type: Number, required: true },
		lastCompatible: {
			version: { type: String, required: true },
			major: { type: Number, required: true },
			minor: { type: Number, required: true },
			patch: { type: Number, required: true },
		},
		type: { type: String, required: true, select: false },
	},
	defaultOptions({})
);

module.exports = mongoose.model('Version', Version, 'Version');
