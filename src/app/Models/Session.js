const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Session = new Schema(
	{
		token: { type: String, required: true },
		user: { type: Schema.ObjectId, refPath: 'User', required: true },
		createdAt: { type: Date, default: () => new Date() },
	},
	defaultOptions({ timestamps: false })
);

module.exports = mongoose.model('Session', Session, 'Session');
