const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentAccount = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		isDefault: { type: Boolean, default: false },
		account: { type: String, unique: true, index: true, required: true },
		email: { type: String },
		connected: { type: Boolean, default: false },
		url: { type: String },
		urlExpiresAt: { type: Date },
	},
	defaultOptions({ timestamps: true })
);

PaymentAccount.statics = {};

module.exports = mongoose.model('PaymentAccount', PaymentAccount, 'PaymentAccount');
