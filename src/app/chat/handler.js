const { httpStatus, getPagination } = require('utils');
const ReviewService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data, files } = req;
		const result = await new ReviewService(data, files).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	async update(req, res) {
		const { user, body: data } = req;
		const { id } = req.params;
		await new ReviewService(data).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await ReviewService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await ReviewService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getRecordsByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await ReviewService.getRecordsByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await ReviewService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = ReviewService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
