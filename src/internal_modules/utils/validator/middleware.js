const { Exception } = require('../error-handlers');
const validator = require('./validator');
const _ = require('lodash');

module.exports = (Schema) => (req, res, next) => {
	if (req.isSocket) {
		req.query = _.omit(req.handshake.query, ['EIO', 'transport']);
		req.params = { id: req.nsp.name.split('/')[2] };
	} else if (!req.files) req.files = {};

	const result = validator(Schema, req);
	if (result.errors) return next(Exception.validation.error(result.errors));

	req.params = result.params;
	req.query = result.query;
	req.body = result.body;

	next();
};
