const { httpStatus } = require('../../constants');
const Exception = require('../Exception');

const model = 'geo';
const code = Exception.generalCodes[model];

const errors = {
	Country_Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Country Not Found.',
	},
	City_Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'City Not Found.',
	},
};

Exception.add(model, code, errors);
