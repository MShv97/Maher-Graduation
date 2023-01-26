const { authorization, getPagination } = require('utils');
const { io, nspRegist } = require('socket');
const Emitter = require('emitter');
const emitter = new Emitter('Chat');
const validator = require('./validator');
const service = require('./service');
const auth = (action) => authorization({ subject: 'Chat', action });

const getByCriteria = nspRegist('/chat', [auth('view'), validator.getByCriteria]);

/********************************
 * @Socket  /socket/chat		*
 ********************************/

getByCriteria.on('connection', async (socket) => {
	const { criteria, pagination } = getPagination(socket.query);
	const result = await service.getByCriteria(socket.user, criteria, pagination).catch(() => {});
	if (result?.data) socket.emit('data', result);
});

emitter.on('data', (_id) => {
	if (!_id) return;

	getByCriteria.sockets.forEach(async (socket) => {
		const result = await service.getByCriteria(socket.user, { _id }, {}).catch(() => {});
		if (result?.data?.length) socket.emit('data', result);
	});
});
