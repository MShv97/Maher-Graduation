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
		code: code + '01',
		msg: 'Appointment conflict.',
	},
};

Exception.add(model, code, errors);
