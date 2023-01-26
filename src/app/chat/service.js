const { Exception } = require('utils');
const { Chat, User } = require('../Models');
const { emitters } = require('emitter');
const mongoose = require('mongoose');

class ChatService {
	constructor(data) {
		this.doctor = data.doctor;
		this.body = data.body;
	}

	async save(user) {
		this.customer = user.id;
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([
				new Chat(this).save({ session }),
				User.exists({ _id: this.doctor, ...User.accessibleBy(user.abilities, 'view').getQuery() }, { session }),
			]);
		});
		emitters.get('Chat').emit('data', result._id);
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

		const group = user.type === User.TYPES.DOCTOR ? 'customer' : 'doctor';
		const result = await Chat.aggregateAndCount(
			[
				{ $match: conditions },
				{ $group: { _id: `$${group}`, lastMessage: { $last: '$$ROOT' } } },
				{
					$lookup: {
						from: 'User',
						localField: '_id',
						foreignField: '_id',
						as: 'user',
						pipeline: [{ $project: { _id: 0, id: '$_id', firstName: 1, lastName: 1, avatar: 1 } }],
					},
				},
			],
			pagination
		);

		result.data = result.data?.map((val) => ({ ...val.user[0], lastMessage: val.lastMessage.body }));

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
