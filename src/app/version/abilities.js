const { Casl } = require('utils');
const { SYSTEM, ADMIN } = require('../Models').User.TYPES;

const subject = 'Version';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[ADMIN]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},
};

Casl.addAbilities(subject, abilities);
