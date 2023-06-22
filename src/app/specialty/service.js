const { Exception, FileService } = require('utils');
const { Specialty, User } = require('../Models');
const mongoose = require('mongoose');

class SpecialtyService {
	constructor(data, files = {}) {
		this.name = data.name;
		this.icon = new FileService(files?.icon?.at(0)).create();
	}

	async save(user) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([new Specialty(this).save({ session }), this.icon?.save({ session })]);
		});

		return { data: { id: result._id } };
	}

	async update(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			await this.validate(user, session);
			const conditions = { _id, ...Specialty.accessibleBy(user.abilities, 'update').getQuery() };
			const [result] = await Promise.all([Specialty.updateOne(conditions, this, { session }), this.icon?.save({ session })]);
			if (!result.matchedCount) throw Exception.specialty.Not_Found;
		});
	}

	static async deleteFile(user, _id, fileId) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...Specialty.accessibleBy(user.abilities, 'update').getQuery() };
			const result = await Specialty.findOne(conditions, 'icon', { session });
			if (!result) throw Exception.specialty.Not_Found;

			if (result.icon.toString() === fileId) result.icon = undefined;
			else throw Exception.file.Not_Found;

			await Promise.all([result.save({ session }), FileService.delete(fileId, session)]);
		});
	}

	static async delete(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...Specialty.accessibleBy(user.abilities, 'delete').getQuery() };
			const [result, hasDoctors] = await Promise.all([
				Specialty.findOneAndDelete(conditions, { projection: 'icon', lean: true, session }),
				User.exists({ specialty: _id }, { session }),
			]);
			if (!result) throw Exception.specialty.Not_Found;
			if (hasDoctors) throw Exception.specialty.Has_Doctors;
			await FileService.delete(result.icon, session);
		});
	}

	static async getById(user, _id) {
		const result = await Specialty.findOne({ _id });
		if (!result) throw Exception.specialty.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = { ...criteria };

			['name'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(`${criteria[key]}`, 'i');
			});

			return result;
		})();

		const result = await Specialty.findAndCount({ conditions, pagination });

		return result;
	}

	static metadata({ keys }) {
		return { data: Specialty.metadata(keys) };
	}
}

module.exports = SpecialtyService;
