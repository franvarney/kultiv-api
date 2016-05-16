const {Server} = require('hapi')
const Logger = require('franston')('server:server')

const {validate} = require('./handlers/auth')
const {env, host, port} = require('../config')
const HapiAuthBearerToken = require('hapi-auth-bearer-token')
const Routes = require('./routes')
require('./connections/postgres')

var server = new Server()

server.connection({
  host: env !== 'production' ? host : null,
  port: parseInt(port, 10),
  routes: { cors: true }
})

server.register(HapiAuthBearerToken, (err) => {
  if (err) return Logger.error(err), throw err

  server.auth.strategy('simple', 'bearer-access-token', {
    allowQueryToken: true,
    allowMultipleHeaders: false,
    accessTokenName: 'auth_token',
    validateFunc: validate
  })

  // TODO add this back in later
  // server.auth.default({
  //   strategy: 'simple'
  // })

  server.start((err) => {
    if (err) return Logger.error(err), throw err

    Logger.info(`Server starting at ${server.info.uri}`)
    server.route(Routes)
  })
})

module.exports = server
