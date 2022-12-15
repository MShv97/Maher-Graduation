function isObject(val) {
	return Object.prototype.toString.call(val) === '[object Object]';
}

function isArrayOrObject(val) {
	return Object(val) === val;
}

function isEmptyObject(val) {
	return Object.keys(val).length === 0;
}

module.exports = (obj = {}, options = {}) => {
	const { separator = '.', useBrackets = false, keepArray = false, overrideArrayIndex = false, ignore = [] } = options;

	function convertToDot(obj, result, path) {
		result = result || {};
		path = path || [];
		const isArray = Array.isArray(obj);

		Object.keys(obj).forEach((key) => {
			const newKey = isArray && overrideArrayIndex ? overrideArrayIndex : key;
			const index = isArray && useBrackets ? '[' + newKey + ']' : newKey;
			const newPath =
				isArray && useBrackets ? path.join(separator).concat('[' + newKey + ']') : path.concat(index).join(separator);

			if (
				!ignore.includes(newPath) &&
				isArrayOrObject(obj[key]) &&
				((isObject(obj[key]) && !isEmptyObject(obj[key])) ||
					(Array.isArray(obj[key]) && !keepArray && obj[key].length !== 0))
			) {
				if (isArray && useBrackets) {
					let previousKey = path[path.length - 1] || '';
					return convertToDot(obj[key], result, path.slice(0, -1).concat(previousKey + index));
				} else return convertToDot(obj[key], result, path.concat(index));
			} else result[newPath] = obj[key];
		});
		return result;
	}

	return convertToDot(obj);
};
