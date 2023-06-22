const { Casl } = require('utils');
const { User, Appointment } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;

const subject = 'Appointment';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[DOCTOR]: (user) => {
		return [
			{
				subject,
				action: ['view', 'approve', 'reject'],
				conditions: {
					doctor: user.id,
					$or: [{ approvedAt: { $exists: true } }, { rejectedAt: { $exists: true } }, { status: Appointment.STATUSES.APPROVED }],
				},
				fields: ['-doctor'],
			},
		];
	},

	[CUSTOMER]: (user) => {
		return [
			{
				subject,
				action: ['save', 'update', 'occupations', 'view', 'cancel'],
				conditions: { customer: user.id },
				fields: ['-customer'],
			},
		];
	},
};

Casl.addAbilities(subject, abilities);
