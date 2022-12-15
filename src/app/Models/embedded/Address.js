const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GeoJSON = require('./GeoJSON');

const Address = new Schema(
	{
		_id: false,
		country: { type: Schema.Types.ObjectId, ref: 'Country', autopopulate: { select: 'name' } },
		city: { type: Schema.Types.ObjectId, ref: 'City', autopopulate: { select: 'name' } },
		location: { type: String },
		geo: { type: GeoJSON, index: '2dsphere' },
	},
	defaultOptions({ timestamps: false, hide: ['geo'] })
);

Address.virtual('longitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[0];
});

Address.virtual('latitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[1];
});

module.exports = Address;
