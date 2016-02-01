const Manager = require('knex-schema');

const Cookbook = require('./handlers/cookbook');
const Package = require('../package.json');
const Ping = require('./handlers/ping');
const User = require('./handlers/user');

const DB = require('./connections/postgres');
const Users = require('../database/schemas/users.js');
const Units = require('../database/schemas/units.js');
const Recipes = require('../database/schemas/recipes.js');
const Cookbooks = require('../database/schemas/cookbooks.js');

const manager = new Manager(DB);

module.exports = [
  // Test route
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // User routes
  { method: 'GET', path: '/user/{username}', handler: User.find },
  { method: 'POST', path: '/user/create', handler: User.create, config: { auth: false } },
  { method: 'PUT', path: '/user/{username}', handler: User.update },
  { method: 'DELETE', path: '/user/{username}', handler: User.delete },

  // Cookbook routes
  { method: 'GET', path: '/user/{username}/cookbooks', handler: Cookbook.allByUser },
  { method: 'GET', path: '/cookbook/{id}', handler: Cookbook.find },
  { method: 'POST', path: '/cookbook/create', handler: Cookbook.create },
  { method: 'PUT', path: '/cookbook/{id}', handler: Cookbook.update },
  { method: 'DELETE', path: '/cookbook/{id}', handler: Cookbook.delete },

  { method: 'GET', path: '/admin/users/migrate', handler: function (req, res) {
    manager.sync([Units,Users,Recipes,Cookbooks]);
    return res('Move bitch....');
  } },

  { method: 'GET', path: '/admin/users/seed', handler: function (req, res) {
    manager.populate([Units,Users,Recipes,Cookbooks]);
    return res('Fran says to test your seed');
  } },

  { method: 'GET', path: '/admin/users/drop', handler: function (req, res) {
    manager.drop([Units,Users,Recipes,Cookbooks]);
    return res('Drop it like it\'s hot');
  } }
];
