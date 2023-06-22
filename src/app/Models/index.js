module.exports = {
	File: require('utils').FileService.Model,
	User: require('./User'),
	UserVerification: require('./UserVerification'),
	Session: require('./Session'),

	Country: require('./Country'),
	City: require('./City'),

	Notification: require('./Notification'),
	NotificationToken: require('./NotificationToken'),

	Appointment: require('./Appointment'),
	Specialty: require('./Specialty'),
	Review: require('./Review'),
	Chat: require('./Chat'),

	Payment: require('./Payment'),
};
