const { httpStatus } = require('../../constants');
const Exception = require('../Exception');

const model = 'database';
const code = Exception.generalCodes[model];

const errors = {
	Conflict: (err) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: `Duplication conflict.`,
		args: err.keyValue,
	}),
	Constraint: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Reference non existing data.',
	},
};

Exception.add(model, code, errors);
