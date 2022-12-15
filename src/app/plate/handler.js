const { httpStatus, getPagination } = require('utils');
const PlateService = require('./service');

module.exports = {
	async getCategories(req, res) {
		const { criteria, pagination } = getPagination(req.query);
		const result = await PlateService.getCategories(criteria, pagination);
		res.status(httpStatus.OK).json(result);
	},

	async getCodes(req, res) {
		const { criteria, pagination } = getPagination(req.query);
		const result = await PlateService.getCodes(criteria, pagination);
		res.status(httpStatus.OK).json(result);
	},
};
