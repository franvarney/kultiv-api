const Auth = require('../handlers/auth')
const AuthSchema = require('../schemas/auth')
const Errors = require('../utils/errors')

module.exports = [
  {
    method: 'POST',
    path: '/auth',
    config: {
      auth: false,
      handler: Auth.login,
      validate: {
        payload: AuthSchema.loginPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/auth',
    handler: Auth.logout
  }
]
