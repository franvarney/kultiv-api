const Errors = require('../utils/errors')
const User = require('../handlers/user')
const UserSchema = require('../schemas/user')

module.exports = [
  {
    method: 'POST',
    path: '/users',
    config: {
      auth: false,
      validate: {
        payload: UserSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: User.create
    }
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: User.get
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    config: {
      validate: {
        payload: UserSchema.updatePayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: User.update
    }
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: User.delete
  }
]
