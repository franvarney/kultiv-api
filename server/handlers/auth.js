const Logger = require('franston')('server:handlers:auth')

const Auth = require('../models/auth')
const Errors = require('../utils/errors')
const User = require('../models/user')

const ALGORITHM = 'sha256'

exports.getCredentialsFunc = function (id, callback) {
  Logger.debug('auth.getCredentialsFunc')

  Auth.set({ id }).findById((err, auth) => {
    if (err) return Logger.error(err), callback(Errors.get(err))
    if (auth) auth.algorithm = ALGORITHM

    User.set({ id: auth.user }).findById((err, user) => {
      if (err) return Logger.error(err), callback(Errors.get(err))

      auth.scope = auth.scope || ['user']
      if (user.is_admin === true) auth.scope.push('admin')

      return callback(null, auth)
    })
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
