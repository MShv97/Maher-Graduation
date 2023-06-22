const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');
const _ = require('lodash');

const model = 'sms';
const code = codes[model];

const errors = {
	Too_Many_Attempts: (args) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Too many attempts.',
		args: _.pick(typeof args === 'string' ? {} : args, ['attempts', 'lastAttempt', 'nextAttempt']),
	}),
};

Exception.add(model, code, errors);
