const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const About = new Schema(
	{
		description: { type: String, required: true },
		facebook: { type: String },
		instagram: { type: String },
		snapchat: { type: String },
		linkedIn: { type: String },
		whatsApp: { type: [String] },
		phones: { type: [String] },
		mobiles: { type: [String] },
	},
	defaultOptions({ timestamps: false })
);

module.exports = mongoose.model('About', About, 'About');
