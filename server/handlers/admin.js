const Manager = require('knex-schema');

const Cookbooks = require('../../database/schemas/cookbooks');
const DB = require('../connections/postgres');
const Recipes = require('../../database/schemas/recipes');
const Units = require('../../database/schemas/units');
const Users = require('../../database/schemas/users');

const manager = new Manager(DB);

exports.migrate = function (request, reply) {
  manager.sync([Units, Users, Recipes, Cookbooks]);
  reply('Move bitch, get out the way!');
};

exports.reset = function (request, reply) {
  manager.reset([Cookbooks, Recipes, Units, Users]);
  reply('Resetedededed');
};

exports.seed = function (request, reply) {
  manager.populate([Units, Users, Recipes, Cookbooks]);
  reply('Put your seeds in me.');
};

exports.drop = function (request, reply) {
  manager.drop([Units, Users, Recipes, Cookbooks]);
  reply('Drop it like it\'s hot.');
};
