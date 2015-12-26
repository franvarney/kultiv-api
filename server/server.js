import {Server} from 'hapi';

import Auth from './handlers/auth';
import Config from '../config';
import HapiAuthBearerToken from 'hapi-auth-bearer-token';
import HapiMongoModels from './plugins/hapi-mongo-models';
import Routes from './routes';

let server = new Server();

server.connection({
  host: Config.env !== 'production' ? Config.host : null,
  port: parseInt(Config.port, 10)
});

server.route(Routes);

server.register([HapiAuthBearerToken, HapiMongoModels], (err) => {
  if (err) console.log(`Plugin error: ${err}`);

  console.log(`Connected to Mongo at ${Config.mongo.uri}`);

  server.auth.strategy('simple', 'bearer-access-token', {
    allowQueryToken: true,
    allowMultipleHeaders: false,
    accessTokenName: 'auth_token',
    validateFunc: Auth.validate
  });

  server.auth.default({
    strategy: 'simple'
  });

  server.start((err) => {
    if (err) throw err;
    console.log(`Server starting at ${server.info.uri}`);
  });
});

export default server;
