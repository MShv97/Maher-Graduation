const moment = require('moment');
const winston = require('winston');
const chalk = require('chalk');

const SocketLogger = winston.createLogger({
	level: 'Socket',
	levels: { Socket: 1, Server: 0 },
	format: winston.format.combine(
		winston.format.ms(),
		winston.format.timestamp(),
		winston.format.printf(({ level, meta, timestamp, ms }) => {
			level = chalk.bold.magenta(level);
			timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
			timestamp = chalk.blue(timestamp);
			ms = chalk.white(ms.padStart(7));
			const method = chalk.bold.greenBright(meta.method);
			const nsp = chalk.bold.yellowBright(meta.nsp);
			const socket = chalk.redBright(meta.socket);
			const user = chalk.magentaBright(meta.user);
			const event = chalk.cyanBright(meta.event ?? '');
			const msg = chalk.whiteBright(meta.msg ?? '');

			return `${timestamp}  ${ms}  ${level}: ${socket}::${user}  ${nsp}  ${method}  ${event}  ${msg}`;
		})
	),
	transports: [new winston.transports.Console()],
});

module.exports = {
	server: (method) => (socket, next) => {
		const meta = {
			method,
			socket: socket.id,
			user: socket.user?.id || '',
			nsp: socket.nsp.name,
		};
		SocketLogger.log('Server', undefined, { meta });

		next();
	},
	socket:
		(socket) =>
		([event, ...args], next, msg) => {
			const meta = {
				method: 'Emit',
				socket: socket.id,
				user: socket.user?.id || '',
				nsp: socket.nsp.name,
				event,
				msg,
			};
			SocketLogger.log('Socket', undefined, { meta });

			next();
		},
};
