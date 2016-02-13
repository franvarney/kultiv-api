const Admin = require('../handlers/admin');
const Cookbook = require('../handlers/cookbook');
const Package = require('../../package.json');
const Ping = require('../handlers/ping');
const Recipe = require('../handlers/recipe');
const User = require('../handlers/user');

module.exports = [
  // Test route
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin routes
  { method: 'GET', path: '/admin/migrate', handler: Admin.migrate },
  { method: 'GET', path: '/admin/reset', handler: Admin.reset },
  { method: 'GET', path: '/admin/seed', handler: Admin.seed },
  { method: 'GET', path: '/admin/drop', handler: Admin.drop },
  { method: 'GET', path: '/admin/users', handler: Admin.users },

  // Cookbook routes
  { method: 'GET', path: '/users/{user_id}/cookbooks', handler: Cookbook.allByUser },
  { method: 'GET', path: '/cookbooks/{id}', handler: Cookbook.get },
  { method: 'POST', path: '/cookbooks', handler: Cookbook.create },
  { method: 'PUT', path: '/cookbooks/{id}', handler: Cookbook.update },
  { method: 'DELETE', path: '/cookbooks/{id}', handler: Cookbook.delete },

  // Recipe routes
  { method: 'GET', path: '/users/{id}/recipes', handler: Recipe.allByUser },
  { method: 'GET', path: '/recipes/{id}', handler: Recipe.get },
  { method: 'POST', path: '/recipes', handler: Recipe.create },
  { method: 'PUT', path: '/recipes/{id}', handler: Recipe.update },
  { method: 'DELETE', path: '/recipes/{id}', handler: Recipe.delete },

  // User routes
  { method: 'GET', path: '/users/{id}', handler: User.get },
  { method: 'POST', path: '/users', handler: User.create, config: { auth: false } },
  { method: 'PUT', path: '/users/{id}', handler: User.update },
  { method: 'DELETE', path: '/users/{id}', handler: User.delete }
];
