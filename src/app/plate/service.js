const config = require('config-keys');
const { PlateCategory, PlateCode, Vehicle } = require('../Models');
const axios = require('axios');

class PlateService {
	static async getCategories({ city }) {
		const result = await PlateCategory.find({ city });
		return { data: result };
	}

	static async getCodes({ category }) {
		const result = await PlateCode.find({ category });
		return { data: result };
	}

	static async getSalikBalance(vehicle) {
		if (!vehicle.plate?.number || !vehicle.salik?.phone) return vehicle.salik;

		const result = await axios
			.post(config.salik.balance, {
				MobileNumber: vehicle.salik.phone,
				PlateSourceId: vehicle.plate.city.salikId,
				PlateCategoryId: vehicle.plate.category.salikId,
				PlateColorId: vehicle.plate.code.salikId,
				PlateNumber: vehicle.plate.number,
				MobileCountryCode: 971,
				PlateCountry: 'AE',
			})
			.catch(console.log);
		if (!result?.data) return vehicle.salik;

		return { ...vehicle.salik, credit: result.data.SalikCredit, valid: result.data.Valid };
	}

	static async getSalikViolations(vehicle, skip = 0, limit = 1000) {
		if (!vehicle.plate?.number || !vehicle.salik?.phone) return vehicle.salik;

		const result = await axios
			.get(config.salik.violations, {
				params: {
					pageNo: skip + 1,
					pageSize: limit,
					plateCatId: vehicle.plate.category.salikId,
					plateColId: vehicle.plate.code.salikId,
					plateNo: vehicle.plate.number,
					emirateId: vehicle.plate.city.salikId,
					showPaid: true,
				},
			})
			.catch(console.log);
		if (!result?.data) return vehicle.salik;

		return { totalRecords: result.data.Result.TotalViolationsCount, data: result.data.Result.Violations };
	}
}

module.exports = PlateService;
