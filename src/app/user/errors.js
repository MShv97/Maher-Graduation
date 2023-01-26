const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'user';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'User not found.',
	},

	Invalid_Validation_Code: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Invalid validation code.',
	},

	Delete_Active: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '04',
		msg: 'Can not delete active user.',
	},
};

Exception.add(model, code, errors);
