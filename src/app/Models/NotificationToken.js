const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationToken = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		token: { type: String, required: true },
		createdAt: { type: Date, default: () => new Date(), required: true },
	},
	defaultOptions({ timestamps: false })
);

NotificationToken.statics = {};

module.exports = mongoose.model('NotificationToken', NotificationToken, 'NotificationToken');
