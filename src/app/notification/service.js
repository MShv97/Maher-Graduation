const { Exception, FCM } = require('utils');
const Emitter = require('emitter');
const emitter = new Emitter('Notification');
const { User, Notification, NotificationToken } = require('../Models');
const _ = require('lodash');

class NotificationService {
	constructor(data) {
		this.user = data.user;
		this.title = data.title;
		this.body = data.body;
		this.resourceModel = data.resourceModel;
		this.resource = data.resource;
		this.data = _.pick(this, ['resourceModel', 'resource']);
	}

	async save(criteria = { type: User.TYPES.CUSTOMER, isActive: true }) {
		let [skip, limit] = [0, 500];
		while (true) {
			const users = await User.find(criteria, '_id', { skip, limit, lean: true });
			if (!users.length) break;

			const notifications = users.map((val) => new NotificationService({ ...this, user: val._id }));
			await Notification.insertMany(notifications);

			emitter.emit('send', { users: users.map((val) => val._id), data: this });

			skip += limit;
		}
	}

	static async send(users, data) {
		let [skip, limit] = [0, 500];
		while (true) {
			const result = await NotificationToken.find({ user: users }, '-_id token', { skip, limit, lean: true });
			if (!result.length) break;

			const tokens = result.map((val) => val.token);
			await FCM.send(tokens, _.pick(data, ['title', 'body', 'data']));

			skip += limit;
		}
	}

	static async subscribe(user, { token }) {
		await NotificationToken.updateOne({ user: user.id, token }, { user: user.id, token }, { upsert: true });
	}

	static async unsubscribe(user, { token }) {
		await NotificationToken.deleteOne({ user: user.id, token });
	}

	static async markAsRead(user, { ids, markedAsRead }) {
		await Notification.updateMany(
			{ _id: ids, ...Notification.accessibleBy(user.abilities, 'mark-as-read').getQuery() },
			{ markedAsRead }
		);
	}

	static async getById(user, _id) {
		const projection = Notification.accessibleFieldsBy(user.abilities, 'view');
		const result = await Notification.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.notification.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...Notification.accessibleBy(user.abilities, 'view').getQuery(),
			};

			return result;
		})();

		const projection = Notification.accessibleFieldsBy(user.abilities, 'view');
		const result = await Notification.findAndCount({ conditions, projection, pagination });

		return result;
	}

	static metadata({ keys }) {
		const result = Notification.metadata(keys);
		if (!keys || keys.includes('firebase')) result.firebase = FCM?.metadata;
		return { data: result };
	}
}

emitter.on('save', async ({ criteria, data }) => {
	await new NotificationService(data).save(criteria);
});

emitter.on('send', async ({ users, data }) => {
	await NotificationService.send(users, data);
});

module.exports = NotificationService;
