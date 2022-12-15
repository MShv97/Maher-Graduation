const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;
const { PaymentSchemas } = require('./embedded');
const Payment = require('./Payment');

const TYPES = { RENT: 'Rent', SELL: 'Sell' };

const Contract = new Schema(
	{
		company: { type: Object, required: true },
		branch: { type: Object, required: true },
		user: { type: Object, required: true },

		type: { type: String, default: TYPES.RENT, required: true },
		paymentType: { type: String, default: Payment.TYPES.ONLINE, required: true },
		statuses: { type: [PaymentSchemas.Status] },

		contractTemplate: { type: Object, required: true },
		vehicle: { type: Object, required: true },
		from: { type: Date },
		to: { type: Date },

		applicationFee: { type: Number, required: true },
		discount: { type: Number, default: 0, required: true },
		subTotal: PaymentSchemas.Price(),
		totalAmount: PaymentSchemas.Price(),
		refunded: { type: Number, default: 0, required: true },

		eSignature: { type: Schema.Types.ObjectId, ref: 'File' },
		payment: { type: Schema.Types.ObjectId, ref: 'payment' },
	},
	defaultOptions({ timestamps: true })
);

Contract.statics = {
	TYPES,
	PAYMENT_TYPES: Payment.TYPES,

	STATUSES: {
		// Payment related statuses
		PENDING_SIGNATURE: 'Pending signature',
		PENDING_PAYMENT: 'Pending payment',
		PAYMENT_CANCELED: 'Payment canceled',
		PAYMENT_FAILED: 'Payment failed',

		// Processing statuses
		PENDING: 'Pending',
		APPROVED: 'Approved',

		// End statuses
		DROPPED: 'Dropped',
		REJECTED: 'Rejected',
		AUTO_REJECTED: 'Auto rejected',
		CANCELED: 'Canceled',
		REFUNDED: 'Refunded',
		DONE: 'Done',
	},
};

module.exports = mongoose.model('Contract', Contract, 'Contract');
