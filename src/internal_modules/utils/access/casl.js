const { Exception } = require('../error-handlers');
const { Ability } = require('@casl/ability');

class Casl {
	constructor() {
		this.abilities = new Map();
	}

	addAbilities(subject, abilities) {
		this.abilities.set(subject, abilities);
	}

	buildFrontEndAbilities(user) {
		return Array.from(this.abilities.values())
			.reduce((acc, cur) => {
				let abilities = cur[user.type] ? cur[user.type](user) : null;
				if (!abilities?.length) return acc;
				const result = { subject: abilities[0].subject };
				result.actions = abilities.flatMap((val) => val.action);

				acc.push(result);
				return acc;
			}, [])
			.flatMap((val) => val);
	}

	buildBackendAbilities(user, withConditions) {
		return Array.from(this.abilities.values())
			.reduce((acc, cur) => {
				let abilities = cur[user.type] ? cur[user.type](user) : null;
				if (!abilities) return acc;
				acc.push(abilities);
				return acc;
			}, [])
			.flatMap((val) => val);
	}

	middleware(action, subject) {
		return (req, _, next) => {
			if (!action && !subject) return next();

			req.user.abilities = new Ability(this.buildBackendAbilities(req.user));

			if (req.user.abilities.can(action, subject)) return next();
			else next(Exception.auth.Insufficient_Permissions({ action, subject }));
		};
	}
}

module.exports = new Casl();
