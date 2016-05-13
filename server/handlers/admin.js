const Manager = require('knex-schema');

const CookbooksCollaborators = require('../../database/schemas/cookbooks-collaborators');
const CookbooksRecipes = require('../../database/schemas/cookbooks-recipes');
const Cookbooks = require('../../database/schemas/cookbooks');
const Foods = require('../../database/schemas/foods');
const Friends = require('../../database/schemas/friends');
const DB = require('../connections/postgres');
const Directions = require('../../database/schemas/directions');
const Ingredients = require('../../database/schemas/ingredients');
const RecipesDirections = require('../../database/schemas/recipes-directions');
const RecipesIngredients = require('../../database/schemas/recipes-ingredients');
const Recipes = require('../../database/schemas/recipes');
const Units = require('../../database/schemas/units');
const Users = require('../../database/schemas/users');

const models = [
  Foods, Units, Users, Cookbooks, Recipes, Friends,
  Directions, Ingredients, CookbooksCollaborators, CookbooksRecipes,
  RecipesIngredients, RecipesDirections
];

const manager = new Manager(DB);

exports.migrate = function (request, reply) {
  manager.sync(models);
  reply('Move bitch, get out the way!');
};

exports.reset = function (request, reply) {
  manager.reset(models);
  reply('Resetedededed');
};

exports.seed = function (request, reply) {
  manager.populate(models);
  reply('Put your seeds in me.');
};

exports.drop = function (request, reply) {
  manager.drop(models);
  reply('Drop it like it\'s hot.');
};

exports.users = function (request, reply) {
  DB('users')
    .then((users) => reply(users))
    .catch((err) => reply(err));
};
