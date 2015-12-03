const Debug = require('debug')('cookbook/src/server');
const Hapi = require('hapi');

const Auth = require('./handlers/auth');
const Config = require('../config');
const HapiAuthBearerToken = require('hapi-auth-bearer-token');
const HapiMongoModels = require('./plugins/hapi-mongo-models');
const Routes = require('./routes');

var server = module.exports = new Hapi.Server();

server.connection({
  host: Config.host,
  port: Number(Config.port)
});

server.route(Routes);

server.register([HapiAuthBearerToken, HapiMongoModels], function (err) {
  if (err) Debug('Plugin error :' + err);

  Debug('Connected to Mongo at %s', Config.mongo.uri);

  server.auth.strategy('simple', 'bearer-access-token', {
    allowQueryToken: true,
    allowMultipleHeaders: false,
    accessTokenName: 'auth_token',
    validateFunc: Auth.validate
  });

  server.auth.default({
    strategy: 'simple'
  });

  server.start(function (err) {
    if (err) throw err;
    Debug('Server starting at %s', server.info.uri);
  });
});
