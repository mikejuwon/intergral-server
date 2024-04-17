const bunyan = require('bunyan');

// logging
const logger = bunyan.createLogger({ name: 'myapp' });
const log = logger.child({ module: 'app.js' });

module.exports = log;