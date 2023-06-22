const { httpStatus, getPagination } = require('utils');
const VersionService = require('./service');

module.exports = {
	save: (type) => async (req, res) => {
		const { user } = req;
		const { body: data } = req;
		const result = await new VersionService(data).save(user, type);
		res.status(httpStatus.CREATED).send(result);
	},

	update: (type) => async (req, res) => {
		const { id } = req.params;
		const { user, body: data } = req;
		await new VersionService(data).update(user, id, type);
		res.sendStatus(httpStatus.UPDATED);
	},

	delete: (type) => async (req, res) => {
		const { user } = req;
		const { id } = req.params;
		await VersionService.delete(user, id, type);
		res.sendStatus(httpStatus.DELETED);
	},

	getLast: (type) => async (req, res) => {
		const { user } = req;
		const result = await VersionService.getLast(user, type);
		res.status(httpStatus.OK).json(result);
	},

	getById: (type) => async (req, res) => {
		const { id } = req.params;
		const { user } = req;
		const result = await VersionService.getById(user, id, type);
		res.status(httpStatus.OK).json(result);
	},

	getByCriteria: (type) => async (req, res) => {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await VersionService.getByCriteria(user, criteria, pagination, type);
		res.status(httpStatus.OK).json(result);
	},
};
