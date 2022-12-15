process.env.TZ = 'UTC';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const configFile = require(`./${process.env.NODE_ENV}.json`);

configFile.port = process.argv[2] || process.env.PORT || configFile.port;

module.exports = configFile;
