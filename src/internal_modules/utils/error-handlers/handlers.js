const { httpStatus } = require('../constants');
const Exception = require('./Exception');
const _ = require('lodash');

module.exports = {
	default: (err) => {
		console.error(err);
		process.exit(1);
	},

	list: (req, res) => {
		const { keys = [] } = req.query;
		const result = keys.length ? _.pick(_.cloneDeep(Exception), keys) : _.cloneDeep(Exception);
		if (result.codes) result.codes = Object.fromEntries(result.codes);
		Object.values(result).forEach((val) => {
			if (typeof val === 'string') return;
			Object.keys(val).forEach((key) => {
				if (typeof val[key] === 'function') val[key] = val[key]("'lorem ipsum'");
			});
		});
		res.status(httpStatus.OK).send({ data: result });
	},

	middleware: (err, req, res, next) => {
		let error = err.msg ? err : Exception.server.Internal_Server_Error;

		//JSON parse errors
		if (err.type == 'entity.parse.failed') error = Exception.validation.JSON_Parsing_Error;

		// Database errors
		if (err.name == 'SequelizeUniqueConstraintError') error = Exception.database.Conflict;
		if (err.name == 'SequelizeForeignKeyConstraintError') error = Exception.database.Constraint;
		if (err.name === 'MongoServerError') {
			if (err.code === 11000) error = Exception.database.Conflict(err);
		}

		// Multer errors
		if (err.name === 'MulterError') {
			error = Exception.file.File_Upload_Failed;
			if (err.code === 'LIMIT_UNEXPECTED_FILE') error = Exception.validation.error([`files.${err.field} is not allowed.`]);
		}

		const { httpStatus, ...body } = error;
		if (httpStatus === 500) console.error(err);
		res.status(httpStatus).json(body);
	},
};
