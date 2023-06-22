const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Appointment = new Schema(
	{
		status: { type: String, default: 'Pending', required: true },
		type: { type: String, required: true },
		doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		date: { type: Date, required: true },
		time: { type: Number, required: true },

		approvedAt: { type: Date },
		canceledAt: { type: Date },
		rejected: { type: Date },
	},
	defaultOptions({ timestamps: false })
);

Appointment.statics = {
	STATUSES: { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELED: 'Canceled' },
	TYPES: { CLINIC: 'Clinic', ONLINE: 'Online' },
};

module.exports = mongoose.model('Appointment', Appointment, 'Appointment');
