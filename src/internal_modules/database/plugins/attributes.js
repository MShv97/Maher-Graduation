module.exports = function (schema, options) {
	schema.statics.attributes = function (omit = [], initialValue = { _id: 0, id: '$_id' }) {
		const keys = Object.keys(schema.paths)
			.filter((key) => {
				if (['__v', '_id'].includes(key)) return false;
				return schema.paths[key].selected === undefined;
			})
			.filter((val) => !omit.includes(val));

		const result = keys.reduce((acc, key) => {
			acc[key] = 1;
			return acc;
		}, initialValue);

		return result;
	};
};
