const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'plate';
const code = codes[model];

const errors = {
	Category_Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Plate category not found.',
	},

	Code_Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Plate code not found.',
	},
};

Exception.add(model, code, errors);
