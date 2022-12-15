const { defaultOptions } = require('database').utils;
const Schema = require('mongoose').Schema;

const vehicle = {
	// DEVICE
	brakeSwitch: { type: Boolean },
	cruiseControl: { type: Boolean },
	clutchSwitch: { type: Boolean },
	fuelLevel: { type: Number },
	mileage: { type: Number },
	ignition: { type: Boolean },
	movement: { type: Boolean },
	// SYSTEM
	outGeoFence: { type: Date },
	overSpeed: { type: Date },
	idling: { type: Date },
	moving: { type: Date },
	parked: { type: Date },
};

const device = {
	// DEVICE
	...vehicle,
	online: { type: Boolean, default: false },
	battery: { voltage: { type: Number }, current: { type: Number }, level: { type: Number } },
	gsmSignal: { type: Number },
	externalVoltage: { type: Number },
	networkType: { type: String },
	sleepMode: { type: String },
	// SYSTEM
	batteryLow: { type: Date },
};

module.exports = (type) => {
	const result = type === 'Device' ? device : vehicle;
	return new Schema({ _id: false, ...result }, defaultOptions({}));
};
