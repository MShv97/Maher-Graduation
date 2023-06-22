module.exports = () => {
	require('fs')
		.readdirSync(__dirname)
		.forEach((file) => (file !== 'index.js' ? require(`./${file}`) : null));
};
