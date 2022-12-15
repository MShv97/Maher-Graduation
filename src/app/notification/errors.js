const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'notification';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Notification not found.',
	},

	Subscribe_Failed: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Subscribe failed.',
	},

	UnSubscribe_Failed: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '03',
		msg: 'Unsubscribe failed.',
	},
};

Exception.add(model, code, errors);
