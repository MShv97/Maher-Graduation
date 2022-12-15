const socketIO = require('socket.io');
const io = new socketIO.Server();

module.exports = {
	...require('./utils'),
	io,
	nspRegist: require('./nspRegist')(io),
	init: require('./init')(io),
};
