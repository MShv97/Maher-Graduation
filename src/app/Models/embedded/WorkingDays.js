const moment = require('moment');

const WorkingDays = {
	_id: false,
	...moment.weekdays().reduce((acc, cur) => (acc[cur] = { type: Array, required: true }) && acc, {}),
};

module.exports = WorkingDays;
