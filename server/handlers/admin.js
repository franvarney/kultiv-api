const Manager = require('knex-schema');

const CookbooksCollaborators = require('../../database/cookbooks-collaborators');
const CookbooksRecipes = require('../../database/cookbooks-recipes');
const Cookbooks = require('../../database/schemas/cookbooks');
const Foods = require('../../database/schemas/foods');
const Friends = require('../../database/friends');
const DB = require('../connections/postgres');
const Directions = require('../../database/schemas/directions');
const Ingredients = require('../../database/schemas/ingredients');
const RecipesDirections = require('../../database/recipes-directions');
const RecipesIngredients = require('../../database/recipes-ingredients');
const Recipes = require('../../database/schemas/recipes');
const Units = require('../../database/schemas/units');
const Users = require('../../database/schemas/users');

const manager = new Manager(DB);

exports.migrate = function (request, reply) {
  manager.sync([Foods, Units, Users]); // lookup tables + users
  manager.sync([Cookbooks, Friends, Recipes, Directions, Ingredients]); //
  manager.sync([CookbooksCollaborators, CookbooksRecipes, RecipesIngredients, RecipesDirections]);
  reply('Move bitch, get out the way!');
};

exports.reset = function (request, reply) {
  manager.reset([CookbooksCollaborators, CookbooksRecipes, RecipesIngredients, RecipesDirections]);
  manager.reset([Cookbooks, Friends, Recipes, Directions, Ingredients]);
  manager.reset([Foods, Units, Users]); // lookup tables + users
  reply('Resetedededed');
};

exports.seed = function (request, reply) {
  manager.populate([Foods, Units, Users]); // lookup tables + users
  manager.populate([Cookbooks, Friends, Recipes, Directions, Ingredients]);
  manager.populate([CookbooksCollaborators, CookbooksRecipes, RecipesIngredients, RecipesDirections]);
  reply('Put your seeds in me.');
};

exports.drop = function (request, reply) {
  manager.drop([Foods, Units, Users]); // lookup tables + users
  manager.drop([Cookbooks, Friends, Recipes, Directions, Ingredients]);
  manager.drop([CookbooksCollaborators, CookbooksRecipes, RecipesIngredients, RecipesDirections]);
  reply('Drop it like it\'s hot.');
};

exports.users = function (request, reply) {
  DB('users')
    .then((users) => reply(users))
    .catch((err) => reply(err));
};
