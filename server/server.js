const Debug = require('debug')('cookbook/server/server')
const {Server} = require('hapi')

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

server.route(Routes)

server.register(HapiAuthBearerToken, (err) => {
  if (err) Debug(`Plugin error: ${err}`)

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
    if (err) throw err
    Debug(`Server starting at ${server.info.uri}`)
  })
})

module.exports = server
