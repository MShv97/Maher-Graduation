const { httpStatus } = require('../constants');
const { Exception } = require('../error-handlers');

const model = 'stripe';
const code = Exception.generalCodes[model];

const errors = {
	Error: (type, message) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: `stripe: ${message}`,
	}),

	Card_Declined: (message) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: message,
	}),

	Amount_Range: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '03',
		msg: 'Payment amount must be greater then 0 and less then 1,000,000 .',
	},
};

Exception.add(model, code, errors);
