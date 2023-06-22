const { convertToDotNotation } = require('database').utils;
const { Exception, FileService, Casl, setGeoJSON } = require('utils');
const { User, Specialty, City, Review, Appointment, Chat } = require('../Models');
const mongoose = require('mongoose');
const _ = require('lodash');

class UserService {
	static profileCompleteKeys = ['firstName', 'lastName', 'birthDate', 'address', 'city'];

	constructor(data = {}, files = {}) {
		this.type = data.type;

		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.birthDate = data.birthDate;
		this.city = data.city;
		this.address = data.address;
		this.online = data.online;
		this.geo = setGeoJSON(data);
		this.phone = data.phone;
		this.email = data.email;
		this.password = data.password;

		this.about = data.about;
		this.specialty = data.specialty;
		this.workingDays = data.workingDays;

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
		this.isProfileComplete = UserService.profileCompleteKeys.every((key) => this[key]);
		if (this.type !== User.TYPES.DOCTOR) ['specialty', 'about', 'workingDays'].forEach((key) => delete this[key]);
		const [result] = await Promise.all([new User(this).save({ session }), this.validate(user, session)]);
		return result;
	}

	static async activate(user, _id, isActive) {
		const conditions = { _id, ...User.accessibleBy(user.abilities, 'activate').getQuery() };
		const result = await User.updateOne(conditions, { isActive });
		if (!result.matchedCount) throw Exception.user.Not_Found;
	}

	async update(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			await this.validate(user, session);
			const data = convertToDotNotation(this, { keepArray: ['geo'], ignore: ['avatar', 'documents', 'files'] });
			const result = await User.accessibleBy(user.abilities, 'update').findOneAndUpdate({ _id }, data, {
				projection: [...UserService.profileCompleteKeys, 'isProfileComplete', 'avatar'],
				lean: true,
				new: true,
				session,
			});
			if (!result) throw Exception.user.Not_Found;
			if (!result.isProfileComplete && UserService.profileCompleteKeys.every((key) => result[key]))
				await User.updateOne({ _id }, { isProfileComplete: true }, { session });
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
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'delete').findOneAndDelete(
					{ _id },
					{ projection: 'avatar documents', lean: true, session }
				),
				Appointment.deleteMany({ $or: [{ customer: _id }, { doctor: _id }] }, { session }),
				Chat.deleteMany({ $or: [{ customer: _id }, { doctor: _id }] }, { session }),
				Review.deleteMany({ $or: [{ customer: _id }, { doctor: _id }] }, { session }),
			]);
			if (!result) throw Exception.user.Not_Found;
			await FileService.deleteArray([result.avatar, ...(result.documents || [])], session);
		});
	}

	static async getById(user, _id) {
		const projection = User.accessibleFieldsBy(user.abilities, 'view');
		const result = await User.accessibleBy(user.abilities, 'view').findOne({ _id }, projection, { populate: 'documents' });
		if (!result) throw Exception.user.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				..._.omit(criteria, ['name', 'longitude', 'latitude', 'distance']),
				...User.accessibleBy(user.abilities, 'view').getQuery(),
			};

			if (criteria.longitude || criteria.latitude) {
				result['geo'] = {
					$near: {
						$geometry: { type: 'Point', coordinates: [criteria.longitude, criteria.latitude] },
						$maxDistance: criteria.distance,
					},
				};
				[pagination.total, pagination.skip, pagination.limit] = [false, 0, 1e6];
			}

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
		projection.push('-birthDate', '-about', '-workingDays', '-city', '-country', '-documents');

		const result = await User.findAndCount({ conditions, projection, pagination });

		result.data = await Promise.all(
			result.data?.map(async (val) => {
				val = val.toObject();
				if (val.type === User.TYPES.CUSTOMER) return val;
				[val.reviews] = await Review.aggregate([
					{ $match: { doctor: val.id } },
					{ $group: { _id: '$doctor', sum: { $sum: '$stars' }, count: { $count: {} } } },
				]);
				delete val.reviews?._id;
				return val;
			})
		);

		return result;
	}

	/****** Mine ********/
	async updateMine(user) {
		if (user.type !== User.TYPES.DOCTOR) ['specialty', 'about', 'workingDays'].forEach((key) => delete this[key]);
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			await this.validate(user, session);
			const data = convertToDotNotation(this, { keepArray: ['geo'], ignore: ['avatar', 'documents', 'files'] });
			const result = await User.accessibleBy(user.abilities, 'update-mine').findOneAndUpdate({ _id: user.id }, data, {
				projection: [...UserService.profileCompleteKeys, 'isProfileComplete'],
				lean: true,
				new: true,
				session,
			});
			if (!result) throw Exception.user.Not_Found;
			if (!result.isProfileComplete && UserService.profileCompleteKeys.every((key) => result[key]))
				await User.updateOne({ _id: user.id }, { isProfileComplete: true }, { session });
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
					projection: 'avatar',
					lean: true,
					session,
				}),
				FileService.insertMany([this.avatar, ...(this.documents || [])], session),
			]);
			if (!result) throw Exception.user.Not_Found;
			if (this.avatar && result.avatar) await FileService.delete(result.avatar, session);
		});
	}

	static async deleteMineFile(user, fileId) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id: user.id, ...User.accessibleBy(user.abilities, 'update-mine').getQuery() };
			const result = await User.findOne(conditions, 'avatar documents', { session });
			if (!result) throw Exception.user.Not_Found;

			if (result.avatar?.toString() === fileId) result.avatar = undefined;
			else if (result.documents?.some((val) => val.toString() === fileId))
				result.documents = result.documents?.filter((val) => val.toString() !== fileId);
			else throw Exception.file.Not_Found;

			await Promise.all([result.save({ session }), FileService.delete(fileId, session)]);
		});
	}

	static async getMine(user) {
		if (!user.id) return { data: { abilities: Casl.buildFrontEndAbilities(user) } };
		const result = await User.findOne({ _id: user.id }).populate('documents');
		if (!result) throw Exception.user.Not_Found;
		return { data: { ...result.toObject(), abilities: Casl.buildFrontEndAbilities(result) } };
	}

	static metadata({ keys }) {
		return { data: User.metadata(keys) };
	}
}

module.exports = UserService;
