const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'auth';
const code = codes[model];

const errors = {
	// UNAUTHORIZED 401

	/* ### Authentication & login ### */

	Unauthenticated: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '01',
		msg: 'Unauthenticated.',
	},

	Invalid_Auth_Email_Password: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '02',
		msg: 'Invalid authentication email or password.',
	},
	Invalid_Auth_Phone_Password: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '03',
		msg: 'Invalid authentication phone or password.',
	},
	Invalid_Auth_Username_Password: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '04',
		msg: 'Invalid authentication username or password.',
	},
	Invalid_Auth_Email_Code: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '05',
		msg: 'Invalid authentication email or code.',
	},
	Invalid_Auth_Phone_Code: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '06',
		msg: 'Invalid authentication phone or code.',
	},

	/* ### Authorization ### */

	Unauthorized: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '20',
		msg: 'Unauthorized.',
	},

	Access_Token_Expired: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '21',
		msg: 'Access Token expired.',
	},
	Invalid_Access_Token: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '22',
		msg: 'Invalid access token.',
	},
	Refresh_Token_Expired: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '23',
		msg: 'Refresh Token expired.',
	},
	Invalid_Refresh_Token: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '24',
		msg: 'Invalid refresh token.',
	},

	Account_Unverified: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '25',
		msg: 'Can not access because account is not verified.',
	},
	Account_Inactive: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '26',
		msg: 'Can not access because account has been deactivated.',
	},
	Account_Profile_Incomplete: {
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '27',
		msg: 'User profile is incomplete.',
	},

	/* ### permissions ### */

	Insufficient_Permissions: (permissions) => ({
		httpStatus: httpStatus.UNAUTHORIZED,
		code: code + '40',
		msg: "You don't have the permissions to do this request.",
		args: permissions,
	}),

	// Bad_Request 400
	Invalid_Old_Password: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '60',
		msg: 'Invalid old password.',
	},
	Account_Already_Verified: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '61',
		msg: 'Account already verified.',
	},
	Account_Already_Active: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '62',
		msg: 'Account already active.',
	},
	Account_Already_inActive: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '63',
		msg: 'Account already inactive.',
	},
};

Exception.add(model, code, errors);
