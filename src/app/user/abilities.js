const { Casl } = require('utils');
const { User } = require('../Models');
const { SYSTEM, DOCTOR, CUSTOMER } = User.TYPES;

const subject = 'User';

const abilities = {
	[SYSTEM]: (user) => {
		return [
			{ subject, action: ['save', 'update', 'activate'], conditions: { _id: { $ne: user.id }, type: { $ne: SYSTEM } } },
			{ subject, action: ['view'], conditions: { _id: { $ne: user.id } }, fields: [''] },
			{ subject, action: ['view-mine', 'update-mine', 'password'], conditions: { _id: user.id }, fields: [''] },
		];
	},

	[DOCTOR]: (user) => {
		return [
			{ subject, action: ['view-mine', 'update-mine', 'password'], conditions: { _id: user.id }, fields: [''] },
			{
				subject,
				action: ['view'],
				conditions: { _id: { $ne: user.id }, type: { $ne: User.TYPES.SYSTEM }, isActive: true, isProfileComplete: true },
				fields: ['-type', '-isActive', '-isProfileComplete'],
			},
		];
	},

	[CUSTOMER]: (user) => {
		return [
			{ subject, action: ['view-mine', 'update-mine', 'password'], conditions: { _id: user.id }, fields: [''] },
			{
				subject,
				action: ['view'],
				conditions: { _id: { $ne: user.id }, type: User.TYPES.DOCTOR, isActive: true, isProfileComplete: true },
				fields: ['-type', '-isActive', '-isProfileComplete'],
			},
		];
	},

	undefined: (user) => {
		return [{ subject, action: ['view-mine'] }];
	},
};

Casl.addAbilities(subject, abilities);
