const EventEmitter = require('events');

class Emitter extends EventEmitter {
	static emitters = new Map();
	constructor(name) {
		super();
		if (!name) throw 'name is require';
		Emitter.emitters.set(name, this);
	}
}

module.exports = Emitter;
