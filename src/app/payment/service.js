const { Exception, Stripe } = require('utils');
const { emitters } = require('emitter');
const { Payment } = require('../Models');
const { isAllowedStatus, setPaymentAccount } = require('./utils');
const mongoose = require('mongoose');
const _ = require('lodash');

class PaymentService {
	constructor(data) {
		this._id = mongoose.Types.ObjectId();
		this.resourceType = data.resourceType;
		this.resource = data.resource;
		this.company = data.company;
		this.branch = data.branch;
		this.user = data.user;

		this.statuses = [{ status: Payment.STATUSES.PENDING }];
		this.type = data.type;
		this.amount = data.amount;
		this.applicationFee = data.amount * (data.applicationFee || 0);
		this.metadata = data.metadata;
		this.method = data.method;
		this.account = data.account;
		this.stripe = {};
	}

	async save(session) {
		if (this.type === Payment.TYPES.ONLINE) {
			this.stripe.account = await setPaymentAccount(this, session);
			const intent = await Stripe.paymentIntents.create(this);
			this.stripe.intent = intent.id;
			this.stripe.client_secret = intent.client_secret;
		} else this.statuses.push({ status: Payment.STATUSES.DONE });

		const payment = await new Payment(this).save({ session });

		return payment._id;
	}

	static async capture(_id, session) {
		const payment = await Payment.findOne(
			{ _id },
			{ type: 1, stripe: 1, status: { $last: '$statuses.status' } },
			{ session, lean: true }
		);
		if (!payment) throw Exception.payment.Not_Found;
		if (!isAllowedStatus(payment, 'capture')) return;

		const { CASH, ONLINE } = Payment.TYPES;
		const update = {
			[CASH]: { status: Payment.STATUSES.DONE },
			[ONLINE]: { status: Payment.STATUSES.TRANSFERRING },
		};
		await Payment.updateOne({ _id }, { $push: { statuses: update[payment.type] } }, { session });

		if (payment.type === ONLINE) await Stripe.paymentIntents.capture(payment);
	}

	static async cancel(_id, data, session) {
		const payment = await Payment.findOne(
			{ _id },
			{ type: 1, stripe: 1, status: { $last: '$statuses.status' } },
			{ session, lean: true }
		);
		if (!payment) throw Exception.payment.Not_Found;
		if (!isAllowedStatus(payment, 'cancel')) return;

		const { CASH, ONLINE } = Payment.TYPES;
		const update = {
			[CASH]: { ...data, status: Payment.STATUSES.CANCELED },
			[ONLINE]: { ...data, status: Payment.STATUSES.CANCELING },
		};
		await Payment.updateOne({ _id }, { $push: { statuses: update[payment.type] } }, { session });

		if (payment.type === ONLINE) await Stripe.paymentIntents.cancel(payment);
	}

	static async refund(_id, data, session) {
		const payment = await Payment.findOne(
			{ _id },
			{ type: 1, refunded: 1, amount: 1, stripe: 1, status: { $last: '$statuses.status' } },
			{ session, lean: true }
		);
		if (!payment) throw Exception.payment.Not_Found;
		if (!isAllowedStatus(payment, 'refund')) return;
		if (data.amount && data.amount > payment.amount - payment.refunded)
			throw Exception.validation.error(['body.amount must be less than or equal to (payment.amount - payment.refunded)']);

		const { CASH, ONLINE } = Payment.TYPES;
		const update = {
			[ONLINE]: { ...data, status: Payment.STATUSES.REFUNDING },
			[CASH]: (() => {
				if (!data.amount || data.amount + payment.refunded === payment.amount)
					return { ...data, status: Payment.STATUSES.REFUNDED };
				return { ...data, status: Payment.STATUSES.PARTIALLY_REFUNDED };
			})(),
		};

		await Payment.updateOne({ _id }, { $push: { statuses: update[payment.type] } }, { session });

		if (payment.type === ONLINE) await Stripe.paymentIntents.refund(payment, data);
	}

	static async bulkCancel(payments, reason) {
		const cashPaymentIds = payments.filter((val) => val.method === Payment.TYPES.CASH).map((val) => val._id);
		const onlinePayment = payments.filter((val) => val.method === Payment.TYPES.ONLINE);
		const onlinePaymentIds = onlinePayment.map((val) => val._id);

		await Promise.all([
			Payment.updateMany({ _id: cashPaymentIds }, { $push: { statuses: { status: Payment.STATUSES.CANCELED, reason } } }),
			Payment.updateMany({ _id: onlinePaymentIds }, { $push: { statuses: { status: Payment.STATUSES.CANCELING, reason } } }),
		]);

		await Promise.all(onlinePayment.map((payment) => Stripe.paymentIntents.cancel(payment)));
	}

	static async getById(user, _id) {
		const projection = Payment.accessibleFieldsBy(user.abilities, 'view');
		const result = await Payment.accessibleBy(user.abilities, 'view').findOne({ _id }, projection, {
			populate: [
				{ path: 'user', select: 'firstName lastName phone' },
				{ path: 'company', select: 'name logo' },
			],
		});
		if (!result) throw Exception.payment.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				..._.omit(criteria, ['status', 'from', 'to']),
				...Payment.accessibleBy(user.abilities, 'view').getQuery(),
			};

			if (criteria.status) result['$expr'] = { $in: [{ $last: '$statuses.status' }, criteria.status] };

			if (criteria.from) {
				if (!result.createdAt) result['createdAt'] = {};
				result['createdAt'].$gte = criteria.from;
			}
			if (criteria.to) {
				if (!result.createdAt) result['createdAt'] = {};
				result['createdAt'].$lte = criteria.to;
			}

			return result;
		})();

		const projection = Payment.accessibleFieldsBy(user.abilities, 'view');
		projection.push('-stripe');
		const result = await Payment.findAndCount(
			{ conditions, projection, pagination },
			{
				populate: [
					{ path: 'user', select: 'firstName lastName phone' },
					{ path: 'company', select: 'name logo' },
				],
			}
		);

		result.data = result.data?.map((val) => {
			val = val.toObject();
			val.status = val.statuses[val.statuses.length - 1];
			delete val.statuses;
			return val;
		});

		return result;
	}

	static metadata({ keys }) {
		const result = Payment.metadata(keys);
		if (!keys || keys.include('stripe')) result.stripe = Stripe.metadata();
		return { data: result };
	}

	/************************************
	 * 									*
	 *			EVENTS HANDLERS			*
	 *     								*
	 ************************************/

	static async onHold(_id) {
		const payment = await Payment.findOneAndUpdate(
			{ _id },
			{ $push: { statuses: { status: Payment.STATUSES.HOLD } } },
			{ projection: 'resource resourceType', lean: true }
		);
		if (!payment) return;
		emitters.get(payment.resourceType)?.emit('onPaymentHold', payment);
		emitters.get('Payment').emit('data', payment._id);
	}

	static async onSuccess(_id) {
		const payment = await Payment.findOneAndUpdate(
			{ _id },
			{ $push: { statuses: { status: Payment.STATUSES.DONE } } },
			{ projection: 'resource resourceType', lean: true }
		);
		if (!payment) return;
		emitters.get(payment.resourceType)?.emit('onPaymentSuccess', payment);
		emitters.get('Payment').emit('data', payment._id);
	}

	static async onCancel(_id, reason) {
		const payment = await Payment.findOneAndUpdate(
			{ _id },
			{ $push: { statuses: { status: Payment.STATUSES.CANCELED, reason } } },
			{ projection: 'resource resourceType', lean: true }
		);
		if (!payment) return;
		emitters.get(payment.resourceType)?.emit('onPaymentCancel', payment);
		emitters.get('Payment').emit('data', payment._id, reason);
	}

	static async onFailure(_id, reason) {
		const payment = await Payment.findOneAndUpdate(
			{ _id },
			{ $push: { statuses: { status: Payment.STATUSES.FAILED, reason } } },
			{ projection: 'resource resourceType', lean: true }
		);
		if (!payment) return;
		emitters.get(payment.resourceType)?.emit('onPaymentFailure', payment);
		emitters.get('Payment').emit('data', payment._id, reason);
	}

	static async onRefund(_id, reason, paymentIntent) {
		const { PARTIALLY_REFUNDED, REFUNDED, CANCELING, CANCELED } = Payment.STATUSES;

		const update = { refunded: paymentIntent.amount_refunded / 100 };
		if (!paymentIntent.refunded) update['$push'] = { statuses: { status: PARTIALLY_REFUNDED } };
		else update['$push'] = { statuses: { status: REFUNDED } };

		const payment = await Payment.findOneAndUpdate({ _id, 'statuses.status': { $nin: [CANCELING, CANCELED] } }, update, {
			projection: 'resource resourceType',
			lean: true,
		});
		if (!payment) return;

		emitters.get(payment.resourceType)?.emit('onPaymentRefund', payment);
		emitters.get('Payment').emit('data', payment._id);
	}
}

emitters.get('Stripe').on('*', async (event) => {
	const eventHandler = {
		'payment_intent.amount_capturable_updated': 'onHold',
		'payment_intent.succeeded': 'onSuccess',
		'payment_intent.canceled': 'onCancel',
		'payment_intent.payment_failed': 'onFailure',
		'charge.refunded': 'onRefund',
		'application_fee.refunded': 'onApplicationFeeRefund',
	};
	if (!eventHandler[event.type] || !PaymentService[eventHandler[event.type]]) return;
	const paymentIntent = event.data.object;
	const { paymentId } = paymentIntent.metadata;
	let reason;
	if (event.type === 'payment_intent.canceled') reason = paymentIntent.cancellation_reason;
	if (event.type === 'payment_intent.payment_failed') reason = paymentIntent.last_payment_error.message;
	await PaymentService[eventHandler[event.type]](paymentId, reason, paymentIntent).catch(console.log);
});

module.exports = PaymentService;
