const { Casl } = require('utils');
const { SYSTEM, ADMIN, CUSTOMER } = require('../Models').User.TYPES;

const subject = 'Notification';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], conditions: { user: user.id }, fields: ['-user'] }];
	},

	[ADMIN]: (user) => {
		return [{ subject, action: ['manage'], conditions: { user: user.id }, fields: ['-user'] }];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['view', 'subscribe', 'mark-as-read'], conditions: { user: user.id }, fields: ['-user'] }];
	},
};

Casl.addAbilities(subject, abilities);
