const { httpStatus, getPagination } = require('utils');
const CityService = require('./service');

module.exports = {
	async getById(req, res) {
		const { id } = req.params;
		const result = await CityService.getById(id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { criteria, pagination } = getPagination(req.query);
		const result = await CityService.getByCriteria(criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},
};
