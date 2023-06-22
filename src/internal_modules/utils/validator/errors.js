const { httpStatus } = require('../constants');
const { Exception } = require('../error-handlers');

const model = 'validation';
const code = Exception.generalCodes[model];

const errors = {
	error: (args) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Request validation error',
		args,
	}),

	JSON_Parsing_Error: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'JSON parsing error.',
	},
};

Exception.add(model, code, errors);
