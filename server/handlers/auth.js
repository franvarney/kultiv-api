const Logger = require('franston')('server:handlers:auth')

const AuthModel = require('../models/auth')
const Errors = require('../utils/errors')

const ALGORITHM = 'sha256'

exports.getCredentialsFunc = function (id, callback) {
  Logger.debug('auth.getCredentialsFunc')

  // TODO admin token

  const Auth = new AuthModel({ payload: { id } })

  Auth.findById((err, auth) => {
    if (err) return Logger.error(err), callback(Errors.get(err))
    if (auth) auth.algorithm = ALGORITHM
    return callback(null, auth)
  })
}

exports.login = function (request, reply) {
  Logger.debug('auth.login')

  let {login, password} = request.payload

  const Auth = new AuthModel({
    payload: { login, password }
  })

  Auth.create((err, auth) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply(auth).code(201)
  })
}

exports.logout = function (request, reply) {
  Logger.debug('auth.login')

  let {credentials} = request.auth

  const Auth = new AuthModel({
    payload: { id: credentials.id, user_id: credentials.user_id }
  })

  Auth.deleteById((err) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply().code(204)
  })
}
