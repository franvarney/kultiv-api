const Debug = require('debug')('cookbook/server/server');
const Hapi = require('hapi');

const Auth = require('./handlers/auth');
const Config = require('../config');
const HapiAuthBearerToken = require('hapi-auth-bearer-token');
const Routes = require('./routes');
require('./connections/postgres');

var server = new Hapi.Server();

server.connection({
  host: Config.env !== 'production' ? Config.host : null,
  port: parseInt(Config.port, 10),
  routes: { cors: true }
});

server.route(Routes);

server.register(HapiAuthBearerToken, function (err) {
  if (err) Debug('Plugin error :' + err);

  server.auth.strategy('simple', 'bearer-access-token', {
    allowQueryToken: true,
    allowMultipleHeaders: false,
    accessTokenName: 'auth_token',
    validateFunc: Auth.validate
  });

  // TODO add this back in later
  // server.auth.default({
  //   strategy: 'simple'
  // });

  server.start(function (err) {
    if (err) throw err;
    Debug('Server starting at %s', server.info.uri);
  });
});

module.exports = server;
