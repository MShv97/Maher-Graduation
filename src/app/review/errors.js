const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'review';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Review not found.',
	},
};

Exception.add(model, code, errors);
