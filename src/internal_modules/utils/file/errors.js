const { httpStatus } = require('../constants');
const { Exception } = require('../error-handlers');

const model = 'file';
const code = Exception.generalCodes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'File not found.',
	},

	File_Upload_Failed: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Error uploading file.',
	},
};

Exception.add(model, code, errors);
