const { httpStatus, getPagination } = require('utils');
const NotificationService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data } = req;
		await new NotificationService(data).save(data.users ? { _id: data.users } : undefined);
		res.sendStatus(httpStatus.OK);
	},

	async subscribe(req, res) {
		const { user, body: data } = req;
		await NotificationService.subscribe(user, data);
		res.sendStatus(httpStatus.OK);
	},

	async markAsRead(req, res) {
		const { user, body: data } = req;
		await NotificationService.markAsRead(user, data);
		res.sendStatus(httpStatus.UPDATED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await NotificationService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await NotificationService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await NotificationService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = NotificationService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
