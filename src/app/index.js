require('./socket');
const axios = require('axios').default;

module.exports = async () => {
	setInterval(async () => {
		console.log('Wake up ...');
		await axios.get('https://maher-graduation.onrender.com/api/country?skip=0&limit=1');
	}, 1000 * 60 * 10);
};
