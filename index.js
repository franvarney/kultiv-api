const Debug = require('debug')('cookbook/index');

require('./config');
require('./server/server');

Debug('Cookbook starting...');
