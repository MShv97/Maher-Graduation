const { Casl } = require('utils');
const { User } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;

const subject = 'Appointment';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[DOCTOR]: (user) => {
		return [{ subject, action: ['view'], conditions: { doctor: user.id }, fields: ['-doctor'] }];
	},

	[CUSTOMER]: (user) => {
		return [
			{ subject, action: ['save', 'update', 'occupations', 'view'], conditions: { customer: user.id }, fields: ['-customer'] },
		];
	},
};

Casl.addAbilities(subject, abilities);
