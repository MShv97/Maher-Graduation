const { sms } = require('config-keys');
const axios = require('axios');

module.exports = {
	send: async (phone, msg, lang = 'en') => {
		if (process.env.NODE_ENV === 'development') return;
	},
};
