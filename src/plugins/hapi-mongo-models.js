const HapiMongoModels = require('hapi-mongo-models');
const Path = require('path');

const Config = require('../../config');

var modelBasePath = './src/models/';

module.exports = {
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
