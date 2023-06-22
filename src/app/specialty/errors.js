const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'specialty';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Specialty not found.',
	},

	Has_Doctors: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Specialty has doctors.',
	},
};

Exception.add(model, code, errors);
