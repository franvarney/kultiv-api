'use strict';

const Treeize = require('treeize');

const Base = require('./base');
const RecipeModel = require('../models/recipe');

const treeize = new Treeize().setOptions({output: {prune:false}});
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

    const baseRecipe = function (queryBuilder) {
      return queryBuilder
        .select('recipes.id', 'recipes.title', 'recipes.cook_time',
                'recipes.prep_time', 'recipes.description', 'recipes.is_private',
                'recipes.created_at', 'recipes.updated_at',
                'recipes.user_id AS user_id', 'U.username AS username',
                'recipes.yield_amount AS yield:amount', 'RU.name AS yield:unit')
        .innerJoin('users AS U', 'U.id', 'recipes.user_id')
        .innerJoin('units AS RU', 'RU.id', 'recipes.yield_unit_id')
        .whereNull('recipes.deleted_at')
    };

    const ingredients = function (queryBuilder) {
      return queryBuilder
        .select('I.id AS ingredients:id', 'I.amount AS ingredients:amount',
                'IU.name AS ingredients:unit', 'F.name AS ingredients:food')
        .innerJoin('recipes_ingredients AS RI', 'recipes.id', 'RI.recipe_id')
          .innerJoin('ingredients AS I', 'I.id', 'RI.ingredient_id')
            .innerJoin('foods AS F', 'I.food_id', 'F.id')
            .innerJoin('units AS IU', 'I.unit_id', 'IU.id')
    };

    const directions = function (queryBuilder) {
      return queryBuilder
        .select('D.id AS directions:id', 'D.direction AS directions:direction')
        .innerJoin('recipes_directions AS RD', 'recipes.id', 'RD.recipe_id')
          .innerJoin('directions AS D', 'RD.direction_id', 'D.id')
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
