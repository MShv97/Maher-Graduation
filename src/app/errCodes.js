const { Exception } = require('utils');

module.exports = {
	...Exception.generalCodes, // reserved from 0 => 10
	version: '000',
	user: '11',
	specialty: '12',
	branch: '13',
	vehicle: '14',
	contract: '16',
	payment: '17',
	about: '18',
	plate: '19',
	notification: '20',
	sms: '21',
	contractTemplate: '22',
	paymentAccount: '23',
	permissionsGroup: '24',
	alarm: '25',
};
