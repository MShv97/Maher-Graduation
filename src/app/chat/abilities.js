const { Casl } = require('utils');
const { User } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;

const subject = 'Chat';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[DOCTOR]: (user) => {
		return [{ subject, action: ['save', 'update', 'view'], conditions: { doctor: user.id }, fields: [''] }];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['save', 'update', 'view'], conditions: { customer: user.id }, fields: [''] }];
	},
};

Casl.addAbilities(subject, abilities);
