const Casl = require('./casl');

module.exports = (p = {}) => {
	const strategy = typeof p === 'string' ? p : p.strategy || 'jwt';

	const authenticate = require('../../../app/auth/authenticate');
	return [authenticate(strategy, p), Casl.middleware(p.action, p.subject)];
};
