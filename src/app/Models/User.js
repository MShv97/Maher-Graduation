const { rounds } = require('config-keys').bcrypt;
const { defaultOptions } = require('database').utils;
const { IsVerified, GeoJSON, WorkingDays } = require('./embedded');
const UserVerification = require('./UserVerification');
const bcrypt = require('bcrypt');
const moment = require('moment');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TYPES = { SYSTEM: 'System', DOCTOR: 'Doctor', CUSTOMER: 'Customer' };

const User = new Schema(
	{
		type: { type: String, enum: TYPES, default: TYPES.CUSTOMER, required: true },

		// personal details
		firstName: { type: String },
		lastName: { type: String },
		birthDate: { type: Date },
		city: { type: Schema.Types.ObjectId, ref: 'City', autopopulate: true },
		country: { type: Schema.Types.ObjectId, ref: 'Country', autopopulate: true },
		address: { type: String },
		geo: { type: GeoJSON, index: '2dsphere' },
		phone: { type: String, unique: true, sparse: true, required: true },
		email: { type: String, unique: true, sparse: true },
		password: { type: String, trim: true, select: false, set: (val) => (val ? bcrypt.hashSync(val, rounds) : val) },
		avatar: { type: Schema.Types.ObjectId, ref: 'File' },
		online: { type: Boolean, default: false },

		// Doctors
		specialty: { type: Schema.Types.ObjectId, ref: 'Specialty', autopopulate: true },
		about: { type: String },
		workingDays: { type: WorkingDays, default: {} },
		documents: { type: [Schema.Types.ObjectId], ref: 'File', default: undefined },

		// system
		isActive: { type: Boolean, default: true },
		isProfileComplete: { type: Boolean, default: false },
		isVerified: { type: IsVerified, default: {} },
		hasPassword: { type: Boolean, default: false, required: true },
		lastLogin: { type: Date, default: () => new Date() },
	},
	defaultOptions({ timestamps: true, hide: ['geo'] })
);

User.statics = {
	TYPES,

	logIn: function (filters, session) {
		return this.findOne(filters, 'type password isVerified', { session });
	},

	auth: async function (filters) {
		const result = await this.findOne(filters, 'type isProfileComplete isActive isVerified', { autopopulate: false });
		if (!result) return;
		return result.toObject();
	},

	isVerified: function (user) {
		if ([TYPES.SYSTEM].includes(user.type)) return true;
		return user.isVerified?.phone || false;
	},
};

User.methods.verifyPassword = function (password) {
	if (!password || !this.password) return false;
	return bcrypt.compare(password, this.password);
};

User.methods.verifyCode = async function (data, session) {
	if (data.email) this.isVerified.email = true;
	if (data.phone) this.isVerified.phone = true;
	const conditions = _.pick(data, ['email', 'phone', 'code']);
	const [verification] = await Promise.all([
		UserVerification.updateOne(conditions, { ttl: moment().add(24, 'hours') }, { session }),
		this.save({ session }),
	]);
	return verification.matchedCount > 0;
};

User.virtual('longitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[0];
});

User.virtual('latitude').get(function () {
	if (!this.geo?.coordinates?.length) return;
	return this.geo.coordinates[1];
});

module.exports = mongoose.model('User', User, 'User');
