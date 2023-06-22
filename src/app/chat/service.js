const { Exception, FileService } = require('utils');
const { Chat, User } = require('../Models');
const { emitters } = require('emitter');
const mongoose = require('mongoose');
const _ = require('lodash');

class ChatService {
	constructor(data, files = {}) {
		this.to = data.to;
		this.body = data.body;

		this.attachments = files.attachments?.map((file) => new FileService(file).create());
	}

	async save(user) {
		this.sender = user.type;
		if (user.type === User.TYPES.DOCTOR) {
			this.doctor = user.id;
			this.customer = this.to;
		} else {
			this.doctor = this.to;
			this.customer = user.id;
		}

		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([
				new Chat(this).save({ session }),
				User.exists({ _id: this.to, ...User.accessibleBy(user.abilities, 'view').getQuery() }, { session }),
				...(this.attachments?.map((attachment) => attachment.save({ session })) || []),
			]);
		});
		emitters.get('Chat').emit('data', result._id);
		emitters.get('Notification').emit('save', {
			criteria: { _id: this.to },
			data: {
				user: this.doctor,
				title: 'New Message',
				body: 'You have new message, click to open it.',
				resourceModel: 'Chat',
				resource: result._id,
			},
		});
		return { data: { id: result._id } };
	}

	async update(user, _id) {
		const conditions = { _id, ...Chat.accessibleBy(user.abilities, 'update').getQuery() };
		const result = await Chat.updateOne(conditions, this);
		if (!result.matchedCount) throw Exception.chat.Not_Found;
	}

	static async delete(user, _id) {
		const conditions = { _id, ...Chat.accessibleBy(user.abilities, 'delete').getQuery() };
		const result = await Chat.deleteOne(conditions);
		if (!result.deletedCount) throw Exception.chat.Not_Found;
	}

	static async getById(user, _id) {
		const projection = Chat.accessibleFieldsBy(user.abilities, 'view');
		const result = await Chat.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.chat.Not_Found;
		return { data: result };
	}

	static async getRecordsByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...Chat.accessibleBy(user.abilities, 'view').getQuery(),
			};

			return result;
		})();

		const sender = user.type === User.TYPES.DOCTOR ? 'customer' : 'doctor';
		const result = await Chat.aggregateAndCount(
			[
				{ $match: conditions },
				{ $group: { _id: `$${sender}`, lastMessage: { $last: '$$ROOT' } } },
				{
					$lookup: {
						from: 'User',
						localField: `lastMessage.${sender}`,
						foreignField: '_id',
						as: 'user',
						pipeline: [{ $project: { _id: 0, id: '$_id', firstName: 1, lastName: 1, avatar: 1 } }],
					},
				},
			],
			pagination
		);

		result.data = result.data?.map((val) => ({
			...val.user[0],
			lastMessage: { id: val.lastMessage._id, ..._.pick(val.lastMessage, ['sender', 'body', 'attachments', 'createdAt']) },
		}));

		return result;
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...Chat.accessibleBy(user.abilities, 'view').getQuery(),
			};

			return result;
		})();

		const projection = Chat.accessibleFieldsBy(user.abilities, 'view');
		const result = await Chat.findAndCount({ conditions, projection, pagination });

		return result;
	}

	static metadata({ keys }) {
		return { data: Chat.metadata(keys) };
	}
}

module.exports = ChatService;
