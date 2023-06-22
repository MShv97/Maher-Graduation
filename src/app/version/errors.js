const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'version';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Version not found.',
	},

	Exist: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Version exist.',
	},
};

Exception.add(model, code, errors);
