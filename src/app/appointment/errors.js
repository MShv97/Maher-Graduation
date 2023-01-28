const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'appointment';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Appointment not found.',
	},

	Conflict: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Appointment conflict.',
	},

	Wrong_Status: (action, status) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '03',
		msg: `Can not ${action} appointment while its status is ${status}.`,
		args: { action, status },
	}),
};

Exception.add(model, code, errors);
