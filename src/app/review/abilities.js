const { Casl } = require('utils');
const { User } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;

const subject = 'Review';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[DOCTOR]: (user) => {
		return [{ subject, action: ['view'], fields: [''] }];
	},

	[CUSTOMER]: (user) => {
		return [
			{ subject, action: ['save', 'update', 'delete'], conditions: { customer: user.id }, fields: [''] },
			{ subject, action: ['view'], fields: [''] },
		];
	},
};

Casl.addAbilities(subject, abilities);
