const {Server} = require('hapi')
const Logger = require('franston')('server:server')

const {getCredentialsFunc} = require('./handlers/auth')
const {env, host, port} = require('../config')
const Plugins = require('./plugins')
const Routes = require('./routes')
require('./connections/postgres')

var server = new Server()

server.connection({
  host: env !== 'production' ? host : null,
  port: parseInt(port, 10),
  routes: { cors: true }
})

server.register(Plugins, (err) => {
  if (err) return Logger.error(err), err

  server.auth.strategy('hawk', 'hawk', { getCredentialsFunc })

  server.auth.default({
    strategy: 'hawk'
  })

  server.start((err) => {
    if (err) return Logger.error(err), err

    Logger.info(`Server starting at ${server.info.uri}`)
    server.route(Routes)
  })
})

module.exports = server
