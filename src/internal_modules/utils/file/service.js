const { Exception } = require('../error-handlers');
const mongoose = require('mongoose');
const Model = require('./Model');

class FileService {
	static Model = Model;
	constructor(data = {}, options = { isPrivate: false }) {
		this._id = mongoose.Types.ObjectId();
		this.originalName = data.originalname;
		this.size = data.size;
		this.mimeType = data.mimetype;
		this.isPrivate = options.isPrivate;
		this.buffer = data.buffer;
	}

	create() {
		if (!this.buffer) return;
		return new Model(this);
	}

	static async insertMany(data, session) {
		data = data.filter((val) => val);
		return Model.insertMany(data, { session });
	}

	static async delete(_id, session) {
		return FileService.deleteArray([_id], session);
	}

	static async deleteArray(ids, session) {
		ids = ids.filter((val) => val);
		if (!ids.length) return;
		return Model.deleteMany({ _id: { $in: ids } }, { session });
	}

	static async getById(_id) {
		const result = await Model.findOne({ _id }, 'mimeType buffer', { lean: true });
		if (!result) throw Exception.file.Not_Found;
		return { mimeType: result.mimeType, buffer: result.buffer.buffer };
	}
}

module.exports = FileService;
