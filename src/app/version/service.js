const { Exception } = require('utils');
const { Version } = require('../Models');
const mongoose = require('mongoose');
const moment = require('moment');

class VersionService {
	constructor(data) {
		this.version = data.version;
		this.major = data.major;
		this.minor = data.minor;
		this.patch = data.patch;
		this.lastCompatible = data.lastCompatible;
	}

	async save(user, type) {
		this.type = type;
		const old = await Version.findOne({ type, version: this.version }, '_id');
		if (old) throw Exception.version.Exist;
		const result = await new Version(this).save();
		return { data: { id: result.version } };
	}

	async update(user, version, type) {
		const result = await Version.accessibleBy(user.abilities, 'update').updateOne({ type, version }, this);

		if (!result.matchedCount) throw Exception.version.Not_Found;
	}

	static async delete(user, version, type) {
		const result = await Version.accessibleBy(user.abilities, 'delete').deleteOne({ type, version });
		if (!result.deletedCount) throw Exception.version.Not_Found;
	}

	static async getLast(user, type) {
		const result = await Version.findOne({ type }, '-_id', { sort: { version: -1 } });
		if (!result) throw Exception.version.Not_Found;
		return { data: result };
	}

	static async getById(user, version) {
		const result = await Version.findOne({ type, version }, '-_id');
		if (!result) throw Exception.version.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination, type) {
		const conditions = (() => {
			const result = { ...criteria, type };
			if (criteria['lastCompatibleVersion'])
				result['lastCompatible.version'] = new RegExp(`${criteria['lastCompatibleVersion']}`, 'i');

			if (criteria['lastCompatibleMajor']) result['lastCompatible.major'] = criteria['lastCompatibleMajor'];
			if (criteria['lastCompatibleMinor']) result['lastCompatible.minor'] = criteria['lastCompatibleMinor'];
			if (criteria['lastCompatiblePatch']) result['lastCompatible.patch'] = criteria['lastCompatiblePatch'];

			delete result.lastCompatibleVersion;
			delete result.lastCompatibleMajor;
			delete result.lastCompatibleMinor;
			delete result.lastCompatiblePatch;

			return result;
		})();

		const projection = '-_id';
		const result = await Version.findAndCount({ conditions, projection, pagination });

		return result;
	}
}

module.exports = VersionService;
