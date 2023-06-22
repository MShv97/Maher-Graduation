const { httpStatus } = require('../constants');
const FileService = require('./service');

module.exports = {
	getById: async (req, res) => {
		const { id } = req.params;
		const result = await FileService.getById(id);
		res.type(result.mimeType).send(result.buffer);
	},
};
