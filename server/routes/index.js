const Admin = require('../handlers/admin')
const Auth = require('../handlers/auth')
const AuthSchema = require('../schemas/auth')
const Cookbook = require('../handlers/cookbook')
const Errors = require('../utils/errors')
const Ping = require('../handlers/ping')
const Recipe = require('../handlers/recipe')
const User = require('../handlers/user')
const UserSchema = require('../schemas/user')

module.exports = [
  // Test
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin
  { method: 'GET', path: '/admin/users', handler: Admin.users },

  // Auth
  {
    method: 'POST',
    path: '/auth',
    config: {
      auth: false,
      validate: {
        payload: AuthSchema.loginPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Auth.login
    }
  },
  { method: 'DELETE', path: '/auth', handler: Auth.logout },

  // Cookbook
  { method: 'GET', path: '/users/{user_id}/cookbooks', handler: Cookbook.allByUser },
  { method: 'GET', path: '/cookbooks/{id}', handler: Cookbook.get },
  { method: 'POST', path: '/cookbooks', handler: Cookbook.create },
  { method: 'PUT', path: '/cookbooks/{id}', handler: Cookbook.update },
  { method: 'DELETE', path: '/cookbooks/{id}', handler: Cookbook.delete },

  // Recipe
  { method: 'GET', path: '/users/{id}/recipes', handler: Recipe.allByUser },
  { method: 'GET', path: '/recipes/{id}', handler: Recipe.get },
  { method: 'POST', path: '/recipes', handler: Recipe.create },
  { method: 'PUT', path: '/recipes/{id}', handler: Recipe.update },
  { method: 'DELETE', path: '/recipes/{id}', handler: Recipe.delete },

  // User
  { method: 'GET', path: '/users/{id}', handler: User.get },
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
  { method: 'PUT', path: '/users/{id}', handler: User.update },
  { method: 'DELETE', path: '/users/{id}', handler: User.delete }
]
