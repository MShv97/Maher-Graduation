const { logger } = require('utils');
const { wrap } = require('./utils');

module.exports = (io) => (path, auth) => {
	const nsp = io.of(path);

	nsp.use(logger.socketLogger.server('Connect'));

	if (auth) {
		if (Array.isArray(auth)) auth.flat().forEach((func) => nsp.use(wrap(func)));
		else nsp.use(wrap(auth));
	}

	nsp.use(logger.socketLogger.server('Connected'));

	nsp.on('connection', (socket) => {
		socket.use(logger.socketLogger.socket(socket));

		socket.on('disconnect', (reason) => {
			logger.socketLogger.socket(socket)(['disconnect'], () => {}, reason);
		});
	});
	return nsp;
};
