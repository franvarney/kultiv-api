'use strict';

const Treeize = require('treeize');

const Base = require('./base');
const RecipeModel = require('../models/recipe');

const treeize = new Treeize({ output: { prune: false } });

const TABLE_NAME = 'recipes';

const baseRecipe = function (queryBuilder) {
  queryBuilder
    .select('recipes.id', 'recipes.title', 'recipes.cook_time',
            'recipes.prep_time', 'recipes.description', 'recipes.is_private',
            'recipes.created_at', 'recipes.updated_at',
            'recipes.user_id AS creator:id', 'U.username AS creator:username',
            'recipes.yield_amount AS yields-:amount', 'RU.name AS yields-:unit')
    .innerJoin('users AS U', 'U.id', 'recipes.user_id')
    .innerJoin('units AS RU', 'RU.id', 'recipes.yield_unit_id')
    .whereNull('recipes.deleted_at')
};

const ingredients = function (queryBuilder) {
  queryBuilder
    .select('I.id AS ingredients:id', 'I.amount AS ingredients:amount',
            'IU.name AS ingredients:unit', 'F.name AS ingredients:food',
            'I.optional AS ingredients:optional')
    .innerJoin('recipes_ingredients AS RI', 'recipes.id', 'RI.recipe_id')
      .innerJoin('ingredients AS I', 'I.id', 'RI.ingredient_id')
        .innerJoin('foods AS F', 'I.food_id', 'F.id')
        .innerJoin('units AS IU', 'I.unit_id', 'IU.id')
};

const directions = function (queryBuilder) {
  queryBuilder
    .select('D.id AS directions:id', 'D.direction AS directions:direction')
    .innerJoin('recipes_directions AS RD', 'recipes.id', 'RD.recipe_id')
      .innerJoin('directions AS D', 'RD.direction_id', 'D.id')
};

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

    if (!isLoaded) {
      this.knex
        .from(this.name)
        .whereRaw(rawQuery)
        .modify(baseRecipe)
        .then((recipes) => {
          done(null, treeize.grow(recipes).getData());
        })
        .catch((err) => done(err));
    } else {
      this.knex
        .from(this.name)
        .whereRaw(rawQuery)
        .modify(baseRecipe)
        .modify(ingredients)
        .modify(directions)
        .then((recipes) => {
          done(null, treeize.grow(recipes).getData());
        })
        .catch((err) => done(err));
    }
  }
}

module.exports = new Recipe();
