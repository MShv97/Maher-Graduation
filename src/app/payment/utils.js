const { Exception } = require('utils');
const { Payment, PaymentAccount, PaymentMethod } = require('../Models');

module.exports = {
	isAllowedStatus: ({ type, status }, action) => {
		const { PENDING, HOLD, REFUNDING, PARTIALLY_REFUNDED, DONE } = Payment.STATUSES;
		const allowedStatuses = {
			[Payment.TYPES.CASH]: {
				capture: [PENDING],
				cancel: [PENDING],
				refund: [PARTIALLY_REFUNDED, DONE],
			},
			[Payment.TYPES.ONLINE]: {
				capture: [HOLD],
				cancel: [PENDING, HOLD],
				refund: [REFUNDING, PARTIALLY_REFUNDED, DONE],
			},
		};
		return allowedStatuses[type][action].includes(status);
	},

	setPaymentAccount: async (data, session) => {
		const conditions = { company: data.company };
		if (data.account) conditions['_id'] = data.account;
		else conditions['isDefault'] = true;

		const result = await PaymentAccount.findOne(conditions, 'account', { lean: true, session });
		if (!result) throw Exception.payment.Missing_Payment_Account;
		return result.account;
	},

	setPaymentMethod: async (user, data, session) => {
		if (!user.stripeCustomerId || !data.method) throw Exception.paymentMethod.Not_Found;
		data.stripe.customer = user.stripeCustomerId;

		const result = await PaymentMethod.accessibleBy(user.abilities, 'view').findOne(
			{ _id: data.method, user: user.id },
			'card',
			{ lean: true, session }
		);
		if (!result) throw Exception.paymentMethod.Not_Found;
		data.stripe.paymentMethod = result.card;
	},
};
