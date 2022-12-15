const { authorization, getPagination } = require('utils');
const { io, nspRegist } = require('socket');
const Emitter = require('emitter');
const emitter = new Emitter('Payment');
const validator = require('./validator');
const service = require('./service');
const auth = (action) => authorization({ subject: 'Payment', action });

const getById = nspRegist(/^\/payment\/(?:([^\/]+?))\/?$/i, [auth('view'), validator.paramId]);
const getByCriteria = nspRegist('/payment', [auth('view'), validator.getByCriteria]);

/********************************
 * @Socket  /socket/payment		*
 ********************************/

// getById.on('connection', async (socket) => {
// 	const { id } = socket.params;
// 	const result = await service.getById(socket.user, id).catch(() => {});
// 	if (result?.data) socket.emit('data', result);
// });

// getByCriteria.on('connection', async (socket) => {
// 	const { criteria, pagination } = getPagination(socket.query);
// 	const result = await service.getByCriteria(socket.user, criteria, pagination).catch(() => {});
// 	if (result?.data) socket.emit('data', result);
// });

emitter.on('data', (_id) => {
	if (!_id) return;
	io.of(`/payment/${_id}`).sockets.forEach(async (socket) => {
		const result = await service.getById(socket.user, _id).catch(() => {});
		if (result) socket.emit('data', result);
	});

	getByCriteria.sockets.forEach(async (socket) => {
		const result = await service.getByCriteria(socket.user, { _id }, {}).catch(() => {});
		if (result?.data?.length) socket.emit('data', result);
	});
});
