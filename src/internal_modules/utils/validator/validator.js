const _ = require('lodash');

module.exports = (Schema, data) => {
	const schema = typeof Schema === 'function' ? Schema(data) : Schema;
	const validationResult = schema.unknown(true).validate(data, { abortEarly: false });

	if (!validationResult.error) return _.pick(validationResult.value, ['params', 'query', 'body']);

	const errors = validationResult.error.details.flatMap((val) => {
		if (val.type === 'alternatives.match') return val.context.details.map((val) => val.message.split('"').join(''));
		return val.message.split('"').join('');
	});
	return { errors };
};
