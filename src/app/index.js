require('./socket');
const VehicleService = require('./vehicle/service');

module.exports = async () => {
	setInterval(async () => {
		await VehicleService.jobs().catch((err) => {
			console.log('Vehicle job failed.');
		});
	}, 1000 * 60 * 60);
};
