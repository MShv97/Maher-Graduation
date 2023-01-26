const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema(
	{
		doctor: { type: Schema.Types.ObjectId, ref: 'User', select: false, required: true },
		customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		stars: { type: Number, required: true },
		comment: { type: String, required: true },
	},
	defaultOptions({ timestamps: { updatedAt: false } })
);

Review.statics = {};

module.exports = mongoose.model('Review', Review, 'Review');
