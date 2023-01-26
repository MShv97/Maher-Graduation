const moment = require('moment');

module.exports = {
	getNextAttempt: (data) => {
		if (!data) return moment().add(1, 'minute').toDate();
		const minutesByAttempts = [0, 1, 2, 5, 10, 30, 120, 120, 360, 720, 1440];
		return moment(data.lastAttempt)
			.add(minutesByAttempts[data.attempts] || 1440, 'minute')
			.toDate();
	},
};
