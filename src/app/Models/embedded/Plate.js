const Schema = require('mongoose').Schema;

module.exports = {
	_id: false,
	city: { type: Schema.Types.ObjectId, ref: 'City', autopopulate: true, required: true },
	category: { type: Schema.Types.ObjectId, ref: 'PlateCategory', autopopulate: true },
	code: { type: Schema.Types.ObjectId, ref: 'PlateCode', autopopulate: true },
	number: { type: String, required: true },
};
