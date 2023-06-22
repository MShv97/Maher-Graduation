require('./init');

const { errorHandlers, logger } = require('utils');
const { port } = require('config-keys');
const database = require('database');
const express = require('express');
const socket = require('socket');
const passport = require('./app/auth/passport');
const { PeerServer } = require('peer');
const Turn = require('node-turn');
const path = require('path');
const app = express();

async function start() {
	await database.connect();

	app.use('/test', express.static(path.join(process.cwd(), 'test')));

	app.use(logger.httpLogger);

	app.use(express.urlencoded({ extended: false }));
	app.use(express.json({ limit: '10mb' }));

	app.use(passport.initialize());
	await require('./app')(app);

	app.use('/api', require('./app/router'));

	app.use(errorHandlers.middleware);

	const httpServer = require('http').createServer(app);

	socket.init({ httpServer });

	PeerServer({ port: 9000, path: '/peerjs' });

	const server = new Turn({
		// set options
		authMech: 'long-term',
		credentials: { username: 'password' },
		listeningPort: port,
	});
	server.start();

	httpServer.listen(port, () => {
		console.info(`Server is listening on port ${port}`);
	});
}

start().catch(errorHandlers.default);
