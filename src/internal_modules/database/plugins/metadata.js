const _ = require('lodash');

module.exports = function (schema, options) {
	schema.statics.metadata = function (keys = []) {
		const result = Object.keys(schema.statics).reduce((acc, cur) => {
			if (typeof schema.statics[cur] !== 'object') return acc;
			if (['refPath'].includes(cur)) return acc;

			acc[cur] = Object.values(schema.statics[cur]);
			return acc;
		}, {});

		if (keys.length) return _.pick(result, keys);
		return result;
	};
};
