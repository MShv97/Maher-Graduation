const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { GeoJSON } = require('./embedded');
const moment = require('moment');

const Branch = new Schema(
	{
		isCompanyActive: { type: Boolean, default: true, select: false, required: true },
		company: { type: Schema.Types.ObjectId, ref: 'Company', select: false, required: true },
		name: { type: String, required: true },
		city: { type: Schema.Types.ObjectId, ref: 'City', autopopulate: true, required: true },
		address: { type: String, required: true },
		geo: { type: GeoJSON, index: '2dsphere' },
		workingDays: [
			{
				_id: false,
				day: { type: String, required: true },
				openingHour: { type: Number, required: true },
				closingHour: { type: Number, required: true },
			},
		],
		contact: {
			phone: { type: [String] },
			mobile: { type: [String] },
			fax: { type: [String] },
			poBox: { type: [String] },
			email: { type: [String] },
		},
		contractTemplate: { type: Schema.Types.ObjectId, ref: 'ContractTemplate' },
	},
	defaultOptions({ timestamps: true, hide: ['geo'] })
);

Branch.virtual('longitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[0];
});

Branch.virtual('latitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[1];
});

Branch.statics = {
	DAYS: moment.weekdays(),
};

module.exports = mongoose.model('Branch', Branch, 'Branch');
