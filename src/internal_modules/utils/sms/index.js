const { sms } = require('config-keys');
const axios = require('axios');

module.exports = {
	send: async (phone, msg, lang = 'en') => {
		if (process.env.NODE_ENV === 'development') return;
		await axios.post(
			`https://elitbuzz-me.com/sms/smsapi`,
			{},
			{
				params: {
					api_key: sms.api_key,
					type: lang === 'ar' ? 'unicode' : 'text',
					contacts: phone,
					senderid: sms.senderid,
					msg,
				},
			}
		);
	},
};
