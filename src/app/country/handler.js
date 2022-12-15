const { httpStatus, getPagination } = require('utils');
const CountryService = require('./service');

module.exports = {
	async getById(req, res) {
		const { id } = req.params;
		const result = await CountryService.getById(id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { criteria, pagination } = getPagination(req.query);
		const result = await CountryService.getByCriteria(criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},
};
