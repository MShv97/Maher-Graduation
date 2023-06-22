const { PAGINATION } = require('../constants').constants;
const { parsePhoneNumber } = require('libphonenumber-js');
const mongoose = require('mongoose');
const Joi = require('joi');
const _ = require('lodash');

Joi.objectId = () =>
	Joi.string()
		.custom((value) => {
			if (mongoose.isObjectIdOrHexString(value)) return mongoose.Types.ObjectId(value);
			throw 'not a valid id';
		})
		.message('{:#label} not a valid id');

Joi.search = (val) => Joi.string().custom(_.escapeRegExp);
Joi.enum = (enumObj) => {
	let values = Array.isArray(enumObj) ? enumObj : Object.values(enumObj);
	values = values.flatMap((val) => {
		if (Array.isArray(val) || typeof val === 'string') return val;
		return Object.values(val);
	});
	return Joi.string().valid(...values);
};

Joi.password = () =>
	Joi.string()
		.min(8)
		.max(24)
		.regex(/^(?=.*?[A-Za-z])(?=.*\d)(?=.*?[^\w]).{8,}$/)
		.message(
			'{:#label} must be minimum 8 characters, maximum 24 characters, at least one letter, one number and one special character'
		);

Joi.phone = () =>
	Joi.custom((value) => parsePhoneNumber(value).number).error((errors) => {
		const errIndex = errors.findIndex((val) => val.code === 'any.custom');
		if (errIndex >= 0) errors[errIndex].message = `${errors[errIndex].local.label} ${errors[errIndex].local.error.message}`;
		return errors;
	});

Joi.address = (required = []) => {
	if (required === '*') required = ['country', 'city', 'location', 'latitude', 'longitude'];
	const result = {
		country: Joi.string(),
		city: Joi.string(),
		location: Joi.string(),
		latitude: Joi.number().min(-90).max(90),
		longitude: Joi.number().min(-180).max(180),
	};
	required.forEach((val) => {
		if (result[val]) result[val] = result[val].required();
	});

	return Joi.object(result).and('latitude', 'longitude');
};

Joi.comparison = (joiType = Joi.number()) => {
	return Joi.alternatives(
		joiType,
		Joi.object({
			$gte: joiType.label('gte'),
			$gt: joiType.label('gt'),
			$lte: joiType.label('lte'),
			$lt: joiType.label('lt'),
		})
			.nand('$gte', '$gt')
			.nand('$lte', '$lt')
			.rename(/.*/, Joi.x('${#0}'))
	);
};

Joi.file = ({ mimetype, size }) => Joi.array().items(Joi.object({ mimetype, size }).unknown(true)).single();

Joi.longitude = () => Joi.number().min(-180).max(180);
Joi.latitude = () => Joi.number().min(-90).max(90);
Joi.points = () =>
	Joi.array()
		.length(2)
		.custom((value, helpers) => {
			if (value[0] < -180 || value[0] > 180) return helpers.message('{:#label}.first must be a valid longitude');
			if (value[1] < -90 || value[1] > 90) return helpers.message('{:#label}.second must be a valid latitude');
			return value;
		});

Joi.polygon = () =>
	Joi.array()
		.items(Joi.points())
		.min(4)
		.custom((value, helpers) => {
			if (value[0][0] !== value[value.length - 1][0] || value[0][1] !== value[value.length - 1][1])
				return helpers.message('{:#label} needs to contain circular polygons.');
			return value;
		});

module.exports = {
	getByCriteria: {
		total: Joi.boolean().default(PAGINATION.total),
		data: Joi.boolean().default(PAGINATION.data),
		skip: Joi.number()
			.integer()
			.min(0)
			.when('data', { is: false, then: Joi.forbidden(), otherwise: Joi.number().default(PAGINATION.skip) }),
		limit: Joi.number()
			.integer()
			.min(1)
			.max(PAGINATION.limit.max)
			.when('data', { is: false, then: Joi.forbidden(), otherwise: Joi.number().default(PAGINATION.limit.default) }),
		sort: Joi.any().when('data', { is: false, then: Joi.forbidden(), otherwise: Joi.any().default(PAGINATION.sort) }),
	},
};
