const Debug = require('debug')('cookbook/src/server');
const Hapi = require('hapi');

const Config = require('../config');
const HapiMongoModels = require('./plugins/hapi-mongo-models');
const Routes = require('./routes');

var server = module.exports = new Hapi.Server();

server.connection({
  host: Config.host,
  port: Number(Config.port)
});

server.route(Routes);

server.register([HapiMongoModels], function (err) {
  if (err) Debug('Plugin error :' + err);

  Debug('Connected to Mongo at %s', Config.mongo.uri);

  server.start(function (err) {
    if (err) throw err;
    Debug('Server starting at %s', server.info.uri);
  });
});
