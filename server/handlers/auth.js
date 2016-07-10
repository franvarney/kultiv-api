const Logger = require('franston')('server:handlers:auth')

const AuthModel = require('../models/auth')
const Errors = require('../utils/errors')

const Auth = new AuthModel()
const ALGORITHM = 'sha256'

exports.getCredentialsFunc = function (id, callback) {
  // TODO admin token

  Auth.findById(id, (err, auth) => {
    if (err) return Logger.error(err), callback(err)
    auth.algorithm = ALGORITHM
    return callback(null, auth)
  })
}

exports.login = function (request, reply) {
  let {login, password} = request.payload

  Auth.create(login, password, (err, auth) => {
    if (err) return Logger.error(err), reply(Errors.get(err))
    return reply(auth).code(201)
  })
}

exports.logout = function (request, reply) {
  let {credentials} = request.auth

  Auth.deleteById(credentials.id, credentials.user_id, (err) => {
    if (err) return Logger.error(err), reply(err)
    return reply().code(204)
  })
}
