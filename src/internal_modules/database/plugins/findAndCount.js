module.exports = function (schema, options) {
	schema.statics.findAndCount = async function ({ pagination, conditions, projection }, options = {}) {
		const { total, data = true, ..._pagination } = pagination || {};
		const queries = [];

		if (total) queries.push(this.countDocuments(conditions).session(options.session));
		else queries.push(undefined);

		if (data) queries.push(this.find(conditions, projection, { ...options, ..._pagination }));
		else queries.push(undefined);

		const [totalRecords, docs] = await Promise.all(queries);
		return { totalRecords, data: docs };
	};
};
