const { httpStatus, getPagination } = require('utils');
const AppointmentService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data } = req;
		const result = await new AppointmentService(data).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	process: (action) => async (req, res) => {
		const { user, body: data } = req;
		const { id } = req.params;
		await AppointmentService.process(user, id, action);
		res.sendStatus(httpStatus.OK);
	},

	async update(req, res) {
		const { user, body: data } = req;
		const { id } = req.params;
		await new AppointmentService(data).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await AppointmentService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await AppointmentService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getOccupations(req, res) {
		const { user } = req;
		const result = await AppointmentService.getOccupations(user, req.query);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await AppointmentService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = AppointmentService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
