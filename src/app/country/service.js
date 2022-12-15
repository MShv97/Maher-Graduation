const { Exception } = require('utils');
const { Country } = require('../Models');
const _ = require('lodash');

class CountryService {
	static async getById(_id) {
		const result = await Country.findOne({ _id });
		if (!result) throw Exception.geo.Country_Not_Found;
		return { data: result };
	}

	static async getByCriteria(criteria, pagination) {
		const conditions = (() => {
			const result = { ...criteria };

			['name', 'code', 'phone'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(criteria[key], 'i');
			});

			return result;
		})();
		pagination.sort = { _id: 1 };
		const result = await Country.findAndCount({ conditions, pagination });

		return result;
	}
}

module.exports = CountryService;
