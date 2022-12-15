const { logger } = require('utils');
const { wrap } = require('./utils');

module.exports =
	(io) =>
	({ httpServer, options = {}, middleware }) => {
		io.attach(httpServer, {
			transports: ['websocket', 'polling'],
			...options,
		});

		io.use(logger.socketLogger.server('Connect'));

		if (middleware) {
			if (Array.isArray(middleware)) middleware.forEach((func) => io.use(wrap(func)));
			else io.use(wrap(middleware));
		}

		io.use(logger.socketLogger.server('Connected'));

		io.on('connection', (socket) => {
			socket.use(logger.socketLogger.socket(socket));

			socket.on('disconnect', (reason) => {
				logger.socketLogger.socket(socket)(['disconnect'], () => {}, reason);
			});
		});

		return io;
	};
