import Cookbook from './handlers/cookbook';
import Package from '../package.json';
import Ping from './handlers/ping';
import User from './handlers/user';

export default [
  // Test route
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // User routes
  { method: 'GET', path: '/user/{username}', handler: User.find },
  { method: 'POST', path: '/user/create', handler: User.create, config: { auth: false } },
  { method: 'PUT', path: '/user/{username}', handler: User.update },
  { method: 'DELETE', path: '/user/{username}', handler: User.remove },

  // Cookbook routes
  { method: 'GET', path: '/user/{username}/cookbooks', handler: Cookbook.allByUser },
  { method: 'GET', path: '/cookbook/{id}', handler: Cookbook.find },
  { method: 'POST', path: '/cookbook/create', handler: Cookbook.create },
  { method: 'PUT', path: '/cookbook/{id}', handler: Cookbook.update },
  { method: 'DELETE', path: '/cookbook/{id}', handler: Cookbook.remove }
];
