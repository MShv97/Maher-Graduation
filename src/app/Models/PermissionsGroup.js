const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionsGroup = new Schema(
	{
		company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
		name: { type: String, required: true },
		description: { type: String, default: '' },
		branches: { type: [Schema.Types.ObjectId], ref: 'Branch' },
		users: { type: [Schema.Types.ObjectId], ref: 'User' },
		permissions: {
			vehicle: { type: [String] },
			contract: { type: [String] },
			payment: { type: [String] },
			alarm: { type: [String] },
		},
	},
	defaultOptions({ timestamps: true })
);

PermissionsGroup.statics = {
	VEHICLE: ['save', 'view', 'update', 'delete'],
	CONTRACT: ['save', 'view', 'sign', 'process', 'cancel', 'reject', 'refund', 'drop'],
	PAYMENT: ['view'],
	ALARM: ['view'],
};

module.exports = mongoose.model('PermissionsGroup', PermissionsGroup, 'PermissionsGroup');
