const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notification = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, required: true },
		body: { type: String, required: true },
		markedAsRead: { type: Boolean, default: false, required: true },

		resourceModel: { type: String },
		resource: { type: Schema.Types.ObjectId, refPath: 'resourceModel' },

		createdAt: { type: Date, default: () => new Date(), required: true },
	},
	defaultOptions({ timestamps: false })
);

Notification.statics = {
	RESOURCES_MODELS: ['Appointment', 'Chat'],
};

module.exports = mongoose.model('Notification', Notification, 'Notification');
