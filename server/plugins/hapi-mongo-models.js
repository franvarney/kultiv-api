import HapiMongoModels from 'hapi-mongo-models';
import Path from 'path';

import Config from '../../config')

let modelBasePath = './server/models/';

export default {
  register: HapiMongoModels,
  options: {
    mongodb: {
      url: Config.mongo.uri,
      options: {}
    },
    autoIndex: false,
    models: {
      Cookbook: Path.join(modelBasePath, 'cookbook'),
      User: Path.join(modelBasePath, 'user')
    }
  }
};
