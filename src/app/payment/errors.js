const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'payment';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Payment not found.',
	},

	Invalid_Status: ({ status }, operation) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: `Can not ${operation} payment because its status is '${status}'.`,
		args: { status, operation },
	}),

	Missing_Payment_Account: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '03',
		msg: 'Unable to process payment.',
	},
};

Exception.add(model, code, errors);
