module.exports = function (schema, options) {
	schema.statics.aggregateAndCount = async function (stage1, pagination, stage2 = []) {
		const { total, data = true, ..._pagination } = pagination || {};
		const paginationStage = ['sort', 'skip', 'limit'].reduce((acc, cur) => {
			if (_pagination[cur] !== undefined) acc.push({ [`$${cur}`]: _pagination[cur] });
			return acc;
		}, []);

		const $facet = {};
		if (total) $facet['totalRecords'] = [{ $count: 'count' }];
		if (data) $facet['data'] = [...paginationStage, ...stage2];

		const [result] = await this.aggregate([...stage1, { $facet }]);
		if (result.totalRecords) result.totalRecords = result.totalRecords[0]?.count || 0;
		return result;
	};
};
