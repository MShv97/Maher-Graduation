const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlateCode = new Schema(
	{
		category: { type: Schema.Types.ObjectId, ref: 'PlateCategory', select: false, required: true },
		en: { type: String, required: true },
		ar: { type: String, required: true },
		salikId: { type: Number, select: false, required: true },
	},
	defaultOptions({ timestamps: false })
);

module.exports = mongoose.model('PlateCode', PlateCode, 'PlateCode');
