module.exports = (data, type = 'Point') => {
	if (!data) return;
	if (['Polygon', 'LineString'].includes(type)) {
		if (type === 'Polygon') data = [data];
		return { type, coordinates: data };
	}
	if (data.longitude === undefined || data.latitude === undefined) return;
	if (data.longitude === null || data.latitude === null) return null;
	return { type, coordinates: [data.longitude, data.latitude] };
};
