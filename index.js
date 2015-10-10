const Debug = require('debug')('cookbook/index');

require('./config');
require('./src/server');

Debug('Cookbook starting...');
