const { Casl } = require('utils');
const { User } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;

const subject = 'Notification';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], conditions: { user: user.id }, fields: ['-user'] }];
	},

	[DOCTOR]: (user) => {
		return [{ subject, action: ['manage'], conditions: { user: user.id }, fields: ['-user'] }];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['view', 'subscribe', 'mark-as-read'], conditions: { user: user.id }, fields: ['-user'] }];
	},
};

Casl.addAbilities(subject, abilities);
