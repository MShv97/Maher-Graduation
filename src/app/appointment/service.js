const { Exception } = require('utils');
const { Appointment, User } = require('../Models');
const { emitters } = require('emitter');
const { getActionUpdate, allowedStatuses } = require('./utils');
const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');

class AppointmentService {
	constructor(data) {
		this.type = data.type;
		this.doctor = data.doctor;
		this.date = data.date;
		this.time = data.time;
	}

	async validate(user, session) {
		await Promise.all([
			(async () => {
				if (!this.doctor) return;
				const conditions = { _id: this.doctor, ...User.accessibleBy(user.abilities, 'view').getQuery() };
				const doctor = await User.exists(conditions, { session, lean: true });
				if (!doctor) throw Exception.user.Not_Found;
			})(),
			(async () => {
				if (!this.date || this.time === undefined) return;
				const conflict = await Appointment.exists(
					{
						_id: { $ne: this._id },
						doctor: this.doctor,
						date: { $gte: moment(this.date).startOf('day').toDate(), $lte: moment(this.date).endOf('day').toDate() },
						time: this.time,
					},
					{ session, lean: true }
				);
				if (conflict) throw Exception.appointment.Conflict;
			})(),
		]);
	}

	async save(user) {
		let result;
		this.customer = user.id;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([new Appointment(this).save({ session }), this.validate(user, session)]);
		});
		emitters.get('Notification').emit('save', {
			criteria: { _id: this.doctor },
			data: {
				user: this.doctor,
				title: 'New Appointment',
				body: 'You have new appointment, click to open it.',
				resourceModel: 'Appointment',
				resource: result._id,
			},
		});
		return { data: { id: result._id } };
	}

	async update(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...Appointment.accessibleBy(user.abilities, 'update').getQuery() };
			const result = await Appointment.findOneAndUpdate(conditions, this, {
				projection: '-customer -createdAt -updatedAt',
				lean: true,
				session,
			});
			if (!result) throw Exception.appointment.Not_Found;
			if (!allowedStatuses['update'].includes(result.status)) throw Exception.appointment.Wrong_Status('update', result.status);
			Object.keys(result).forEach((key) => (this[key] = this[key] !== undefined ? this[key] : result[key]));
			await this.validate(user, session);
		});
		emitters.get('Notification').emit('save', {
			criteria: { _id: this.doctor },
			data: {
				user: this.doctor,
				title: 'Appointment Updated',
				body: 'One of your appointments has been updated, click to open it.',
				resourceModel: 'Appointment',
				resource: result._id,
			},
		});
	}

	static async process(user, _id, action) {
		const [conditions, update] = [
			{ _id, ...Appointment.accessibleBy(user.abilities, 'action').getQuery() },
			getActionUpdate(action),
		];
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			result = await Appointment.findOneAndUpdate(conditions, update, { projection: 'doctor customer status', lean: true, session });
			if (!result) throw Exception.appointment.Not_Found;
			if (!allowedStatuses[action].includes(result.status)) throw Exception.appointment.Wrong_Status(action, result.status);
		});
		const receiver = user.type === User.TYPES.CUSTOMER ? result.doctor : result.customer;
		emitters.get('Notification').emit('save', {
			criteria: { _id: receiver },
			data: {
				user: receiver,
				title: 'Appointment Updated',
				body: 'One of your appointments has been updated, click to open it.',
				resourceModel: 'Appointment',
				resource: result._id,
			},
		});
	}

	static async getById(user, _id) {
		const projection = Appointment.accessibleFieldsBy(user.abilities, 'view');
		const result = await Appointment.accessibleBy(user.abilities, 'view').findOne({ _id }, projection, {
			populate: [
				{ path: 'doctor', select: 'firstName lastName phone avatar' },
				{ path: 'customer', select: 'firstName lastName phone avatar' },
			],
		});
		if (!result) throw Exception.specialty.Not_Found;
		return { data: result };
	}

	static async getOccupations(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				..._.omit(criteria, ['from', 'to']),
				date: { $gte: criteria.from },
			};

			if (criteria.to) result['date'].$lte = criteria.to;

			return result;
		})();

		const result = await Appointment.find(conditions, '-_id date time', { lean: true });

		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				..._.omit(criteria, ['from', 'to']),
				...Appointment.accessibleBy(user.abilities, 'view').getQuery(),
			};

			if (criteria.from || criteria.to) {
				result['date'] = {};
				if (criteria.from) result['date'].$gte = criteria.from;
				if (criteria.to) result['date'].$lte = criteria.to;
			}

			['name'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(`${criteria[key]}`, 'i');
			});

			return result;
		})();

		const projection = Appointment.accessibleFieldsBy(user.abilities, 'view');
		const result = await Appointment.findAndCount(
			{ conditions, projection, pagination },
			{
				populate: [
					{ path: 'doctor', select: 'firstName lastName avatar' },
					{ path: 'customer', select: 'firstName lastName avatar' },
				],
			}
		);

		return result;
	}

	static metadata({ keys }) {
		return { data: Appointment.metadata(keys) };
	}
}

module.exports = AppointmentService;
