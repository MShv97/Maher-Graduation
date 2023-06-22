const _ = require('lodash');

module.exports = (fields, accessibility = []) => {
	const result = fields.reduce((acc, cur) => {
		if (typeof cur !== 'string') return { ...acc, ...cur };
		acc[cur] = 1;
		return acc;
	}, {});

	return _.omit(
		result,
		accessibility.map((val) => val.split('-')[1])
	);
};
