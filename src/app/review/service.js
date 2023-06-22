const { Exception } = require('utils');
const { Review, User } = require('../Models');
const mongoose = require('mongoose');

class ReviewService {
	constructor(data) {
		this.doctor = data.doctor;
		this.stars = data.stars;
		this.comment = data.comment;
	}

	async save(user) {
		this.customer = user.id;
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([
				new Review(this).save({ session }),
				User.exists({ _id: this.doctor, ...User.accessibleBy(user.abilities, 'view').getQuery() }, { session }),
			]);
		});

		return { data: { id: result._id } };
	}

	async update(user, _id) {
		const conditions = { _id, ...Review.accessibleBy(user.abilities, 'update').getQuery() };
		const result = await Review.updateOne(conditions, this);
		if (!result.matchedCount) throw Exception.review.Not_Found;
	}

	static async delete(user, _id) {
		const conditions = { _id, ...Review.accessibleBy(user.abilities, 'delete').getQuery() };
		const result = await Review.deleteOne(conditions);
		if (!result.deletedCount) throw Exception.review.Not_Found;
	}

	static async getByDoctorId(user, doctor) {
		const result = await Review.aggregate([
			{ $match: { doctor, ...Review.accessibleBy(user.abilities, 'view').getQuery() } },
			{ $group: { _id: '$stars', count: { $count: {} } } },
		]);
		const groupedByStars = result.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});
		return { data: new Array(11).fill(0).reduce((acc, cur, idx) => ({ ...acc, [idx]: groupedByStars[idx] || 0 }), {}) };
	}

	static async getById(user, _id) {
		const projection = Review.accessibleFieldsBy(user.abilities, 'view');
		const result = await Review.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.review.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...Review.accessibleBy(user.abilities, 'view').getQuery(),
			};

			return result;
		})();

		const projection = Review.accessibleFieldsBy(user.abilities, 'view');
		const result = await Review.findAndCount(
			{ conditions, projection, pagination },
			{ populate: [{ path: 'customer', select: 'firstName lastName avatar' }] }
		);

		return result;
	}

	static metadata({ keys }) {
		return { data: Review.metadata(keys) };
	}
}

module.exports = ReviewService;
