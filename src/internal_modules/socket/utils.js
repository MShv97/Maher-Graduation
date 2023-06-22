const wrap = (middleware) => (socket, next) => (socket.isSocket = true) && middleware(socket, {}, next);

module.exports = {
	wrap,
};
