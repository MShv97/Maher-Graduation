const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { PaymentSchemas } = require('./embedded');

const TYPES = { CASH: 'Cash', ONLINE: 'Online' };

const Payment = new Schema(
	{
		company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
		branch: { type: Schema.Types.ObjectId, ref: 'Branch', select: false, required: true },
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		resourceType: { type: String, required: true },
		resource: { type: Schema.Types.ObjectId, refPath: 'resourceType' },

		statuses: { type: [PaymentSchemas.Status] },
		type: { type: String, enum: TYPES, default: TYPES.ONLINE, required: true },
		account: { type: Schema.Types.ObjectId, ref: 'PaymentAccount' },

		amount: PaymentSchemas.Price(),
		refunded: { type: Number, default: 0, required: true },
		applicationFee: { type: Number, required: true },

		stripe: { type: Object },
	},
	defaultOptions({ timestamps: true })
);

Payment.statics = {
	TYPES,
	STATUSES: {
		PENDING: 'Pending',
		HOLD: 'Hold',
		TRANSFERRING: 'Transferring',
		DONE: 'Done',
		FAILED: 'Failed',
		CANCELING: 'Canceling',
		CANCELED: 'Canceled',
		REFUNDING: 'Refunding',
		PARTIALLY_REFUNDED: 'Partially Refunded',
		REFUNDED: 'Refunded',
	},
	RESOURCE_TYPES: ['Contract'],

	getTotal: async function (resourceType, resources) {
		if (!resources?.length) return 0;
		const result = await this.find(
			{ resourceType, resource: resources, 'statuses.status': { $in: [STATUSES.DONE] } },
			'amount',
			{ lean: true }
		);
		return result.reduce((a, c) => (a += c.amount), 0);
	},
};

module.exports = mongoose.model('Payment', Payment, 'Payment');
