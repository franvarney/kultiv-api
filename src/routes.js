const Child = require('child_process');

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
  { method: 'POST', path: '/user/create', handler: User.create },
  { method: 'PUT', path: '/user/username', handler: User.update },
  { method: 'DELETE', path: '/user/{username}', handler: User.delete }
];
