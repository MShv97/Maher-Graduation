const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerification = new Schema(
	{
		// common
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		code: { type: String, required: true },
		// email specific
		email: { type: String },
		// phone specific
		phone: { type: String },
		attempts: { type: Number },
		lastAttempt: { type: Date },
		nextAttempt: { type: Date },
		ttl: { type: Date, expires: 0, select: false },
	},
	defaultOptions({ timestamps: false })
);

UserVerification.statics = {};

module.exports = mongoose.model('UserVerification', UserVerification, 'UserVerification');
