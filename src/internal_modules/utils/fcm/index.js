const { firebase: firebaseConfig } = require('config-keys');
const firebase = require('firebase-admin');

firebase.initializeApp({ credential: firebase.credential.cert(firebaseConfig) });

module.exports = {
	subscribe: async (token) => {
		await firebase.messaging().subscribeToTopic(token, 'all');
	},

	unsubscribe: async (token) => {
		await firebase.messaging().unsubscribeFromTopic(token, 'all');
	},

	send: async (tokens, { title, body, data }) => {
		data = JSON.parse(JSON.stringify(data || {}));
		await firebase.messaging().sendMulticast({ tokens, notification: { title, body }, data }).catch(console.log);
	},

	metadata: { vapidKey: firebaseConfig.vapidKey },
};
