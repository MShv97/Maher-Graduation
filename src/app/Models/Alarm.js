const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Alarm = new Schema(
	{
		company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
		branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
		type: { type: String, required: true },
		message: { type: String, required: true },
		acknowledged: { type: [Schema.Types.ObjectId], ref: 'User', select: false },
		terminated: { by: { type: Schema.Types.ObjectId, ref: 'User' }, at: { type: Date } },
		createdAt: { type: Date, default: () => new Date() },
		vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
		device: { type: Schema.Types.ObjectId, ref: 'Device', select: false },
	},
	defaultOptions({ timestamps: false })
);

Alarm.statics = {
	TYPES: { SALIK_CREDIT: 'Salik credit', GEO_FENCE: 'Geo fence', OVER_SPEED: 'Over speed', LOW_BATTERY: 'Low battery' },
};

module.exports = mongoose.model('Alarm', Alarm, 'Alarm');
