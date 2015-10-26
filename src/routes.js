const Child = require('child_process');

const Cookbook = require('./controllers/cookbook');
const Package = require('../package.json');
const User = require('./controllers/user');

var out;

function ping(req, reply) {
  Child.exec('node -v', function (err, stdout) {
    if (err) throw err;

    out = {
      engine: stdout.replace('\n', ''),
      env: process.env.NODE_ENV || 'undefined', // eslint-disable-line
      version: Package.version
    };

    reply(out).code(200);
  });
}

module.exports = [
  // Test route
  { method: 'GET', path: '/ping', handler: ping },

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
  { method: 'DELETE', path: '/cookbook/{id}', handler: Cookbook.delete }
];
