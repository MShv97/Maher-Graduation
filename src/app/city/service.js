const { Exception } = require('utils');
const { City } = require('../Models');
const _ = require('lodash');

class CityService {
	static async getById(_id) {
		const result = await City.findOne({ _id });
		if (!result) throw Exception.geo.City_Not_Found;
		return { data: result };
	}

	static async getByCriteria(criteria, pagination) {
		const conditions = (() => {
			const result = _.omit(criteria, ['name']);

			if (criteria['name'])
				result.$or = [{ en: new RegExp(criteria['name'], 'i') }, { ar: new RegExp(criteria['name'], 'i') }];

			return result;
		})();
		pagination.sort = { _id: 1 };
		const result = await City.findAndCount({ conditions, pagination });

		return result;
	}
}

module.exports = CityService;
