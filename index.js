const Logger = require('franston')('index')

require('./config')
require('./server/server')

Logger.info('Cookbook starting...')
