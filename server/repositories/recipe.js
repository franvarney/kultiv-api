'use strict';

const Treeize = require('treeize');

const Base = require('./base');
const RecipeModel = require('../models/recipe');

const treeize = new Treeize();
const TABLE_NAME = 'recipes';

class Recipe extends Base {
  constructor() {
    super(TABLE_NAME, RecipeModel);
  }

  findByUserId(userId, isLoaded, done) {
    this.loadRecipe(`recipes.user_id = ${userId}`, isLoaded, done);
  }

  findByTitle(title, isLoaded, done) {
    this.loadRecipe(`recipes.title LIKE %${title}%`, isLoaded, done);
  }

  loadRecipe(rawQuery, isLoaded, done) {
    if (typeof isLoaded === 'function') {
      done = isLoaded;
      isLoaded = false;
    }

    if (!done) done = Function.prototype;

    var baseRecipe = function (queryBuilder) {
      queryBuilder
        .select('recipes.id AS id', 'recipes.title AS details:title', 'recipes.cook_time AS details:cook_time',
                'recipes.prep_time AS details:prep_time', 'recipes.description AS details:description', 'recipes.is_private AS details:is_private',
                'recipes.created_at AS details:created_at', 'recipes.updated_at AS details:updated_at',
                'recipes.user_id AS user:id', 'U.username AS user:username',
                'recipes.yield_amount AS yield:amount', 'RU.name AS yield:unit')
        .innerJoin('users AS U', 'U.id', 'recipes.user_id')
        .innerJoin('units AS RU', 'RU.id', 'recipes.yield_unit_id')
        .whereNull('recipes.deleted_at')
        .groupBy('recipes.id', 'U.username', 'RU.name')
    };

    var ingredients = function (queryBuilder) {
      queryBuilder
        .select('I.id AS ingredients:id', 'I.amount AS ingredients:amount',
                'IU.name AS ingredients:unit', 'F.name AS ingredients:food')
        .innerJoin('recipes_ingredients AS RI', 'recipes.id', 'RI.recipe_id')
          .innerJoin('ingredients AS I', 'I.id', 'RI.ingredient_id')
            .innerJoin('foods AS F', 'I.food_id', 'F.id')
            .innerJoin('units AS IU', 'I.unit_id', 'IU.id')
        .groupBy('RI.recipe_id', 'I.id', 'IU.name', 'F.name')
    };

    var directions = function (queryBuilder) {
      queryBuilder
        .select('D.id AS directions:id', 'D.direction AS directions:direction')
        .innerJoin('recipes_directions AS RD', 'recipes.id', 'RD.recipe_id')
          .innerJoin('directions AS D', 'RD.direction_id', 'D.id')
        .groupBy('D.id')
    };

    if (!isLoaded) {
      this.db
        .whereRaw(rawQuery)
        .modify(baseRecipe)
        .then((recipes) => {
          var formatted = treeize.grow(recipes);
          done(null, formatted.getData());
        })
        .catch((err) => done(err));
    } else {
      this.db
        .whereRaw(rawQuery)
        .modify(baseRecipe)
        .modify(ingredients)
        .modify(directions)
        .then((recipes) => {
          var formatted = treeize.grow(recipes);
          done(null, formatted.getData());
        })
        .catch((err) => done(err));
    }
  }
}

module.exports = new Recipe();
