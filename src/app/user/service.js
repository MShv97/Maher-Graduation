const { convertToDotNotation } = require('database').utils;
const { Exception, FileService, Casl } = require('utils');
const { User, Specialty, City } = require('../Models');
const mongoose = require('mongoose');
const _ = require('lodash');

class UserService {
	constructor(data = {}, files = {}) {
		this.type = data.type;

		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.birthDate = data.birthDate;
		this.city = data.city;
		this.address = data.address;
		this.phone = data.phone;
		this.email = data.email;
		this.password = data.password;

		this.about = data.about;
		this.specialty = data.specialty;

		if (data.password) this['hasPassword'] = true;
		if (data.email) this['isVerified.email'] = false;
		if (data.phone) this['isVerified.phone'] = false;

		this.avatar = new FileService(files?.avatar?.at(0)).create();
		this.documents = files.documents?.map((file) => new FileService(file).create());
	}

	async validate(user, session) {
		await Promise.all([
			(async () => {
				if (!this.specialty) return;
				const specialty = await Specialty.exists({ _id: this.specialty }, { lean: true, session });
				if (!specialty) throw Exception.specialty.Not_Found;
			})(),
			(async () => {
				if (!this.city) return;
				const city = await City.findOne({ _id: this.city }, 'country', { lean: true, session });
				if (!city) throw Exception.geo.City_Not_Found;
				this.country = city.country;
			})(),
			this.avatar?.save({ session }),
			...(this.documents?.map((document) => document.save({ session })) || []),
		]);
	}

	async save(user) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			result = await this.create(user, session);
		});
		return { data: { id: result._id } };
	}

	async create(user, session) {
		this.isProfileComplete = ['firstName', 'lastName', 'birthDate', 'address', 'city'].every((key) => this[key]);
		const [result] = await Promise.all([new User(this).save({ session }), this.validate(user, session)]);
		return result;
	}

	static async activate(user, _id, isActive) {
		const conditions = { _id, ...User.accessibleBy(user.abilities, 'activate').getQuery() };
		const result = await User.updateOne(conditions, { isActive });
		if (!result.matchedCount) throw Exception.user.Not_Found;
	}

	async update(user, _id) {
		const data = convertToDotNotation(this, { ignore: ['avatar', 'documents', 'files'] });
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'update').findOneAndUpdate({ _id }, data, {
					projection: 'firstName lastName birthDate city address isProfileComplete avatar',
					lean: true,
					session,
				}),
				this.validate(user, session),
			]);
			if (!result) throw Exception.user.Not_Found;
			if (!isProfileComplete && ['firstName', 'lastName', 'birthDate', 'city', 'address'].every((key) => result[key]))
				User.updateOne({ _id }, { isProfileComplete: true }, { session });
			if (this.avatar && result.avatar) await FileService.delete(result.avatar, session);
		});
	}

	static async deleteFile(user, _id, fileId) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...User.accessibleBy(user.abilities, 'update').getQuery() };
			const result = await User.findOne(conditions, 'avatar documents', { session });
			if (!result) throw Exception.user.Not_Found;

			if (result.avatar?.toString() === fileId) result.avatar = undefined;
			else if (result.documents?.some((val) => val.toString() === fileId))
				result.documents = result.documents?.filter((val) => val.toString() !== fileId);
			else throw Exception.file.Not_Found;

			await Promise.all([result.save({ session }), FileService.delete(fileId, session)]);
		});
	}

	static async delete(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const result = await User.accessibleBy(user.abilities, 'delete').findOneAndDelete(
				{ _id },
				{ projection: 'avatar documents', lean: true, session }
			);
			if (!result) throw Exception.user.Not_Found;
			await FileService.deleteArray([result.avatar, ...(result.documents || [])], session);
		});
	}

	static async getById(user, _id) {
		const projection = User.accessibleFieldsBy(user.abilities, 'view');
		const result = await User.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.user.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				..._.omit(criteria, ['name']),
				...User.accessibleBy(user.abilities, 'view').getQuery(),
			};

			if (criteria.name)
				result['$expr'] = {
					$regexMatch: {
						input: { $concat: ['$firstName', ' ', '$lastName'] },
						regex: new RegExp(`${criteria.name}`, 'i'),
					},
				};

			['firstName', 'lastName', 'email', 'phone', 'address'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(criteria[key], 'i');
			});
			['country', 'city'].forEach((key) => {
				if (criteria[key]) result[key] = { $in: criteria[key] };
			});

			return result;
		})();

		const projection = User.accessibleFieldsBy(user.abilities, 'view');
		projection.push('-hasPassword', '-isVerified', '-lastLogin', '-createdAt', '-updatedAt');
		projection.push('-birthDate', '-about', '-country', '-documents');

		const result = await User.findAndCount({ conditions, projection, pagination });

		return result;
	}

	/****** Mine ********/
	async updateMine(user) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const data = convertToDotNotation(this, { ignore: ['avatar', 'files'] });
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'update-mine').findOneAndUpdate({ _id: user.id }, data, {
					projection: 'avatar',
					lean: true,
					session,
				}),
				this.validate(user, session),
			]);
			if (!result) throw Exception.user.Not_Found;
			if (this.avatar && result.avatar) await FileService.delete(result.avatar, session);
		});
	}

	static async changePassword(user, data) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const result = await User.accessibleBy(user.abilities, 'password').findOneAndUpdate(
				{ _id: user.id },
				{ hasPassword: true, password: data.new },
				{ projection: 'password', session }
			);
			if (!result) throw Exception.user.Not_Found;
			if (result.password) {
				const matched = await result.verifyPassword(data.old);
				if (!matched) throw Exception.auth.Invalid_Old_Password;
			}
		});
	}

	async uploadMineFiles(user) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'update-mine').findOneAndUpdate({ _id: user.id }, this, {
					projection: 'avatar eSignature',
					lean: true,
					session,
				}),
				FileService.insertMany([this.avatar, this.eSignature], session),
			]);
			if (!result) throw Exception.user.Not_Found;
			await FileService.deleteArray([result.avatar, result.eSignature], session);
		});
	}

	static async deleteMineFile(user, fileId) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id: user.id, ...User.accessibleBy(user.abilities, 'update-mine').getQuery() };
			const result = await User.findOne(conditions, 'avatar eSignature', { session });
			if (!result) throw Exception.user.Not_Found;

			if (result.avatar?.toString() === fileId) result.avatar = undefined;
			else if (result.eSignature?.toString() === fileId) result.eSignature = undefined;
			else throw Exception.file.Not_Found;

			await Promise.all([result.save({ session }), FileService.delete(fileId, session)]);
		});
	}

	static async getMine(user) {
		if (!user.id) return { data: { abilities: Casl.buildFrontEndAbilities(user) } };
		const result = await User.findOne({ _id: user.id });
		if (!result) throw Exception.user.Not_Found;
		return { data: { ...result.toObject(), abilities: Casl.buildFrontEndAbilities(result) } };
	}

	static metadata({ keys }) {
		return { data: User.metadata(keys) };
	}
}

module.exports = UserService;
