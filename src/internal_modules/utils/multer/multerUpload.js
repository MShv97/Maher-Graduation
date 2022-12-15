const multer = require('multer');

module.exports = (...fields) => multer().fields(fields.map((field) => ({ name: field })));
