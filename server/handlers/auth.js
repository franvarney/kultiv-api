const Logger = require('franston')('server:handlers:auth')

const Auth = require('../models/auth')
const Errors = require('../utils/errors')

const ALGORITHM = 'sha256'

exports.getCredentialsFunc = function (id, callback) {
  Logger.debug('auth.getCredentialsFunc')

  // TODO admin token

  Auth.set({ id }).findById((err, auth) => {
    if (err) return Logger.error(err), callback(Errors.get(err))
    if (auth) auth.algorithm = ALGORITHM
    return callback(null, auth)
  })
}

exports.login = function (request, reply) {
  Logger.debug('auth.login')

  let {login, password} = request.payload

  Auth.set({ login, password }).create((err, auth) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply(auth).code(201)
  })
}

exports.logout = function (request, reply) {
  Logger.debug('auth.login')

  let {credentials} = request.auth

  Auth
    .set({ id: credentials.id, user_id: credentials.user_id })
    .deleteById((err) => {
      if (err) return Logger.error(err), reply(Errors.get(err))
      return reply().code(204)
    })
}
