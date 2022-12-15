const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;
const { Plate, GeoJSON, Status, Settings } = require('./embedded');

const Vehicle = new Schema(
	{
		isActive: { type: Boolean, default: true, required: true },
		status: { type: String, required: true },
		plate: { type: Plate },
		stats: { type: Status('Vehicle'), default: {} },
		settings: {
			salik: {
				type: Settings({
					credit: { type: Number, default: 60, required: true },
					message: { type: String, default: 'Low balance on salik' },
				}),
				default: { isActive: true },
			},
			// geoFence: {
			// 	type: Settings({ message: { type: String, default: 'Driver is out of geofence.' } }),
			// 	default: {},
			// },
			// speed: {
			// 	type: Settings({
			// 		limit: { type: Number, default: 60, required: true },
			// 		message: { type: String, default: 'Driver over speeding.' },
			// 	}),
			// 	default: {},
			// },
		},
		pricing: {
			daily: { price: { type: Number }, discount: { type: Number } },
			weekly: { price: { type: Number }, discount: { type: Number } },
			monthly: { price: { type: Number }, discount: { type: Number } },
		},
		// Specifications
		maker: { type: String },
		model: { type: String },
		category: { type: String },
		manufacturingYear: { type: Number },
		trim: { type: String },
		color: { type: String },
		transmission: { type: String },
		cruiseControl: { type: Boolean },
		roofWindow: { type: Boolean },
		doors: { type: Number },
		engine: { number: { type: String }, fuelType: { type: String }, fuelCapacity: { type: String } },
		// info
		license: { number: { type: String }, expiryDate: { type: Date } },
		insurance: { expiryDate: { type: Date }, provider: { type: String } },
		chassisNumber: { type: String },
		images: { type: [Schema.Types.ObjectId], ref: 'File' },
		// 3rd party
		salik: { type: Object },
		// System
		isCompanyActive: { type: Boolean, default: true, select: false, required: true },
		company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
		branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
		geo: { type: GeoJSON, index: '2dsphere' },
	},
	defaultOptions({ timestamps: true })
);

Vehicle.virtual('stats.longitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[0];
});

Vehicle.virtual('stats.latitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[1];
});

Vehicle.statics = {
	STATUSES: { AVAILABLE: 'Available', MAINTENANCE: 'Maintenance' },
	CATEGORIES: ['Hatchback', 'Crossover', 'Convertible', 'Sedan', 'SportsCar', 'Coupe', 'Minivan', 'Van', 'Wagon'],
	FUEL_TYPES: ['Gasoline', 'Diesel'],
	TRANSMISSIONS: ['Automatic', 'Manual'],
};

module.exports = mongoose.model('Vehicle', Vehicle, 'Vehicle');
