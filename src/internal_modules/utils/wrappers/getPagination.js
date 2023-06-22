const _ = require('lodash');

module.exports = (query) => {
	const paginationFields = ['total', 'data', 'skip', 'limit', 'sort'];
	const pagination = _.pick(query, paginationFields);
	const criteria = _.omit(query, paginationFields);

	if (pagination.sort === 'asc') pagination.sort = { _id: 1 };
	if (pagination.sort === 'desc') pagination.sort = { _id: -1 };

	return { pagination, criteria };
};
