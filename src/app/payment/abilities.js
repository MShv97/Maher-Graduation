const { User, Payment } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;
const { Casl } = require('utils');

const subject = 'Payment';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['view'], conditions: {}, fields: ['-stripe'] }];
	},

	[DOCTOR]: (user) => {
		const conditions = {
			company: user.company,
			$or: [{ type: Payment.TYPES.CASH }, { 'statuses.status': { $in: [Payment.STATUSES.HOLD] } }],
		};
		if (user.role === User.ROLES.EMPLOYEE)
			return user.abilities
				.filter((val) => val.permissions.payment.length)
				.flatMap((val) => ({
					subject,
					action: val.permissions.payment,
					conditions: { ...conditions, branches: { $in: val.branches } },
					fields: ['-company', '-stripe'],
				}));

		return [{ subject, action: ['manage'], conditions, fields: ['-company', '-stripe'] }];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['view'], conditions: { user: user.id }, fields: ['-user'] }];
	},
};

Casl.addAbilities(subject, abilities);
