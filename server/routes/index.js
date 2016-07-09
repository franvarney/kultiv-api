const Admin = require('../handlers/admin')
const Auth = require('../handlers/auth')
const Cookbook = require('../handlers/cookbook')
const Ping = require('../handlers/ping')
const Recipe = require('../handlers/recipe')
const User = require('../handlers/user')

module.exports = [
  // Test
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin
  { method: 'GET', path: '/admin/users', handler: Admin.users },

  // Auth
  { method: 'POST', path: '/auth', handler: Auth.login, config: { auth: false } },
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
  { method: 'POST', path: '/users', handler: User.create, config: { auth: false } },
  { method: 'PUT', path: '/users/{id}', handler: User.update },
  { method: 'DELETE', path: '/users/{id}', handler: User.delete }
]
