const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Status = new Schema(
	{
		status: { type: String, required: true },
		at: { type: Date, default: () => new Date() },
		reason: { type: String },
		amount: { type: Number },
	},
	defaultOptions({ _id: false })
);

const Price = (required = true) => ({
	type: Number,
	min: 0,
	required,
	set: (value) => (value ? Math.round(value * 100) / 100 : value),
});

module.exports = { Status, Price };
