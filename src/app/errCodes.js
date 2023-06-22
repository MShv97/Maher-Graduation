const { Exception } = require('utils');

module.exports = {
	...Exception.generalCodes, // reserved from 0 => 10
	version: '000',
	user: '11',
	specialty: '12',
	review: '13',
	chat: '14',
	appointment: '15',
	contract: '16',
	payment: '17',
	notification: '20',
	sms: '21',
};
