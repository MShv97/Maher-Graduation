const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Chat = new Schema(
	{
		doctor: { type: Schema.Types.ObjectId, ref: 'User', select: false, required: true },
		customer: { type: Schema.Types.ObjectId, ref: 'User', select: false, required: true },
		sender: { type: String, required: true },
		body: { type: String },
		attachments: { type: [Schema.Types.ObjectId], ref: 'File', default: undefined },
	},
	defaultOptions({ timestamps: { updatedAt: false } })
);

Chat.statics = {};

module.exports = mongoose.model('Chat', Chat, 'Chat');
