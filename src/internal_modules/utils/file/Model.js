const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;

const File = new Schema(
	{
		originalName: { type: String, required: true },
		size: { type: Number, select: false, required: true },
		mimeType: { type: String, select: false, required: true },
		buffer: { type: Buffer, select: false, required: true },
	},
	defaultOptions({})
);

module.exports = mongoose.model('File', File, 'File');
