const { httpStatus, getPagination } = require('utils');
const SpecialtyService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data, files } = req;
		const result = await new SpecialtyService(data, files).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	async update(req, res) {
		const { user, body: data, files } = req;
		const { id } = req.params;
		await new SpecialtyService(data, files).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async deleteFile(req, res) {
		const { user } = req;
		const { id, fileId } = req.params;
		await SpecialtyService.deleteFile(user, id, fileId.toString());
		res.sendStatus(httpStatus.DELETED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await SpecialtyService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await SpecialtyService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await SpecialtyService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = SpecialtyService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
