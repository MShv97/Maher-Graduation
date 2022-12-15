const { httpStatus, getPagination, Stripe } = require('utils');
const PaymentService = require('./service');

module.exports = {
	async webHook(req, res) {
		const { body: data, headers } = req;
		await Stripe.handleHookEvent(data, headers['stripe-signature']);
		res.sendStatus(httpStatus.OK);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await PaymentService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await PaymentService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = PaymentService.metadata(req.query);
		res.status(httpStatus.OK).send(result);
	},
};
