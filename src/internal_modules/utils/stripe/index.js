require('./errors');
const { Exception } = require('../error-handlers');
const Emitter = require('emitter');
const emitter = new Emitter('Stripe');
const { server, stripe: stripeConfig } = require('config-keys');
const Stripe = require('stripe')(stripeConfig.secretKey);
const _ = require('lodash');

class StripeService {
	paymentIntents = {
		create: async (payment) => {
			if (payment.amount >= 1e6) throw Exception.stripe.Amount_Range;
			const [data, headers] = [
				{
					amount: Math.round(payment.amount * 100), // Stripe only accepts in cents,
					currency: payment.currency || 'AED',
					customer: payment.stripe.customer,
					capture_method: 'manual',
					metadata: { paymentId: payment._id.toString() },
				},
				{},
			];

			if (payment.stripe.paymentMethod) {
				data['payment_method'] = payment.stripe.paymentMethod;
				data['confirm'] = true;
				data['setup_future_usage'] = 'off_session';
			}
			if (payment.stripe.account) {
				// data['transfer_data'] = { destination: payment.stripe.account, amount };
				headers['stripeAccount'] = payment.stripe.account;
				data['application_fee_amount'] = Math.round(payment.applicationFee * 100);
			}

			const result = await Stripe.paymentIntents.create(data, headers).catch(this.errorsHandler);

			return result;
		},

		capture: async (payment) => {
			await Stripe.paymentIntents
				.capture(payment.stripe.intent, {}, { stripeAccount: payment.stripe.account })
				.catch(this.errorsHandler);
		},

		cancel: async (payment) => {
			await Stripe.paymentIntents
				.cancel(
					payment.stripe.intent,
					{ cancellation_reason: 'requested_by_customer' },
					{ stripeAccount: payment.stripe.account }
				)
				.catch(this.errorsHandler);
		},

		refund: async (payment, data) => {
			await Stripe.refunds
				.create(
					{
						payment_intent: payment.stripe.intent,
						amount: data.amount ? data.amount * 100 : undefined,
						refund_application_fee: data.refundApplicationFee,
						// reverse_transfer: true,
						metadata: { paymentId: payment._id.toString() },
					},
					{ stripeAccount: payment.stripe.account }
				)
				.catch(this.errorsHandler);
		},
	};

	accounts = {
		create: async (metadata = {}) => {
			const account = await Stripe.accounts.create({ type: 'standard' }).catch(this.errorsHandler);
			const accountLink = await this.accounts.links(account.id, metadata);

			return { id: account.id, ...accountLink };
		},

		links: async (accountId, metadata = {}) => {
			const query = new URLSearchParams(metadata).toString();
			const accountLink = await Stripe.accountLinks
				.create({
					account: accountId,
					return_url: `${server.domain}/${stripeConfig.returnUrl}?${query}`,
					refresh_url: `${server.domain}/${stripeConfig.refreshUrl}?${query}`,
					type: 'account_onboarding',
				})
				.catch(this.errorsHandler);
			return accountLink;
		},

		delete: async (accountId) => {
			const { deleted } = await Stripe.accounts.del(accountId).catch(this.errorsHandler);
			return deleted;
		},
	};

	customers = {
		create: async (metadata = {}) => {
			const result = await Stripe.customers.create({ metadata }).catch(this.errorsHandler);
			return result;
		},
	};

	paymentMethods = {
		create: async (customer, { type, card }, metadata = {}) => {
			const result = await Stripe.paymentMethods.create({ type, card, metadata }).catch(this.errorsHandler);
			await Stripe.paymentMethods.attach(result.id, { customer }).catch(this.errorsHandler);
			return result.id;
		},

		delete: async (id) => {
			await Stripe.paymentMethods.detach(id).catch(this.errorsHandler);
		},
	};

	metadata() {
		return _.pick(stripeConfig, ['publishableKey']);
	}

	/************************************
	 * 									*
	 *		WEBHOOK EVENTS HANDLERS		*
	 *     								*
	 ************************************/

	async handleHookEvent(event, stripeSignature) {
		//TODO: stripeSignature
		// 'payment_intent.amount_capturable_updated'
		// 'payment_intent.succeeded'
		// 'payment_intent.canceled'
		// 'payment_intent.payment_failed'
		// 'charge.refunded'
		// 'account.updated'
		// 'account.application.deauthorized'
		// 'customer.deleted'
		emitter.emit('*', event);
	}

	errorsHandler(err) {
		switch (err.type) {
			case 'StripeCardError':
				// A declined card error
				// => e.g. "Your card's expiration year is invalid."
				throw Exception.stripe.Card_Declined(err.message);
				break;
			case 'StripeRateLimitError':
				// Too many requests made to the API too quickly
				break;
			case 'StripeInvalidRequestError':
				// Invalid parameters were supplied to Stripe's API
				break;
			case 'StripeAPIError':
				// An error occurred internally with Stripe's API
				break;
			case 'StripeConnectionError':
				// Some kind of error occurred during the HTTPS communication
				break;
			case 'StripeAuthenticationError':
				// You probably used an incorrect API key
				break;
			default:
				// Handle any other types of unexpected errors
				break;
		}
		throw Exception.stripe.Error(err.type, err.message);
	}
}

module.exports = new StripeService();
