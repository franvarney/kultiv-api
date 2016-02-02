const Admin = require('../handlers/admin');
const Cookbook = require('../handlers/cookbook');
const Package = require('../../package.json');
const Ping = require('../handlers/ping');
const User = require('../handlers/user');

module.exports = [
  // Test route
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin routes
  { method: 'GET', path: '/admin/migrate', handler: Admin.migrate },
  { method: 'GET', path: '/admin/reset', handler: Admin.reset },
  { method: 'GET', path: '/admin/seed', handler: Admin.seed },
  { method: 'GET', path: '/admin/drop', handler: Admin.drop },

  // Cookbook routes
  { method: 'GET', path: '/user/{username}/cookbooks', handler: Cookbook.allByUser },
  { method: 'GET', path: '/cookbook/{id}', handler: Cookbook.find },
  { method: 'POST', path: '/cookbook/create', handler: Cookbook.create },
  { method: 'PUT', path: '/cookbook/{id}', handler: Cookbook.update },
  { method: 'DELETE', path: '/cookbook/{id}', handler: Cookbook.delete },

  // User routes
  { method: 'GET', path: '/users/{id}', handler: User.find },
  // { method: 'POST', path: '/user/create', handler: User.create, config: { auth: false } },
  // { method: 'PUT', path: '/user/{username}', handler: User.update },
  // { method: 'DELETE', path: '/user/{username}', handler: User.delete }
];
