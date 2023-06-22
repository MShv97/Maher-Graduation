const mongoose = require('mongoose');
const _ = require('lodash');

const transform = (__, ret, hide = []) => {
	ret = _.omit(ret, ['_id', '__t']);
	hide.forEach((val) => {
		if (typeof val === 'string') delete ret[val];
		else val(ret);
	});

	if (!ret.id) delete ret.id;
	else ret.id = mongoose.Types.ObjectId(ret.id);

	const { id, ...rest } = ret;
	return { id, ...rest };
};

module.exports = (options = {}) => {
	options.timestamps = options.timestamps || false;
	return {
		...options,
		selectPopulatedPaths: false,
		useNestedStrict: true,
		optimisticConcurrency: true,
		toObject: {
			virtuals: true,
			getters: true,
			versionKey: false,
			transform: (__, ret) => transform(__, ret, options.hide),
		},
		toJSON: {
			virtuals: true,
			getters: true,
			versionKey: false,
			transform: (__, ret) => transform(__, ret, options.hide),
		},
	};
};
