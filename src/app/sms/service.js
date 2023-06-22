require('./errors');
const { Exception, SMS } = require('utils');
const { UserVerification } = require('../Models');
const { getNextAttempt } = require('./utils');

class SMSService {
	static async sendVerify(user, session) {
		const verification = await UserVerification.findOneAndUpdate(
			{ phone: user.phone },
			{ $unset: { ttl: 1 } },
			{ lean: true, session }
		);
		// if (verification && verification.nextAttempt > new Date()) throw Exception.sms.Too_Many_Attempts(verification);
		const code = '123456';
		//process.env.NODE_ENV === 'development' ? '123456' : parseInt(Math.random() * 1e6);
		await Promise.all([
			UserVerification.updateOne(
				{ phone: user.phone },
				{ user: user._id, code, lastAttempt: new Date(), $inc: { attempts: 1 }, nextAttempt: getNextAttempt(verification) },
				{ upsert: true, session }
			),
			SMS.send(user.phone, `Your code is ${code}. Never share this with anyone.`),
		]);
	}
}

module.exports = SMSService;
