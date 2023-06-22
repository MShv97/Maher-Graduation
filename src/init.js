require('express-async-errors');
const {
	logger: { console: logger },
} = require('utils');

console.log = function () {
	return logger.info.apply(logger, arguments);
};
console.info = function () {
	return logger.info.apply(logger, arguments);
};
console.warn = function () {
	return logger.warn.apply(logger, arguments);
};
console.debug = function () {
	return logger.debug.apply(logger, arguments);
};
console.error = function () {
	return logger.error.apply(logger, arguments);
};
