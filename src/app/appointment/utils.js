const { Appointment } = require('../Models');

module.exports = {
	getActionUpdate: (action) =>
		({
			approve: { approvedAt: new Date(), status: Appointment.STATUSES.APPROVED },
			reject: { rejectedAt: new Date(), status: Appointment.STATUSES.REJECTED },
			cancel: { canceledAt: new Date(), status: Appointment.STATUSES.CANCELED },
		}[action]),

	allowedStatuses: {
		update: [Appointment.STATUSES.PENDING],
		approve: [Appointment.STATUSES.PENDING],
		reject: [Appointment.STATUSES.PENDING],
		cancel: [Appointment.STATUSES.PENDING],
	},
};
