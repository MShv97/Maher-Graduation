const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Company = new Schema(
	{
		name: { type: String, required: true },
		isActive: { type: Boolean, default: false, required: true },
		socialMedia: {
			facebook: { type: String },
			instagram: { type: String },
			twitter: { type: String },
			whatsapp: { type: [String] },
			website: { type: String },
		},
		logo: { type: Schema.Types.ObjectId, ref: 'File' },
		tradeLicense: { type: Schema.Types.ObjectId, ref: 'File' },
		images: { type: [Schema.Types.ObjectId], ref: 'File' },
		// System
		applicationFee: { type: Number },
	},
	defaultOptions({ timestamps: true })
);

Company.statics = {};

module.exports = mongoose.model('Company', Company, 'Company');
