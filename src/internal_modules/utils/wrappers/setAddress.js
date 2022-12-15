const setGeoJSON = require('./setGeoJSON');

module.exports = (address) => {
	if (!address) return;
	const result = {};

	if (address.country) result['country'] = address.country;
	if (address.city) result['city'] = address.city;
	if (address.province) result['province'] = address.province;
	if (address.location) result['location'] = address.location;
	result.geo = setGeoJSON(address, 'Point');

	return result;
};
