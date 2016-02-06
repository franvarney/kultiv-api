'use strict';

const Base = require('./base');
const RecipeModel = require('../models/recipe');

const TABLE_NAME = 'recipes';

class Recipe extends Base {
  constructor() {
    super(TABLE_NAME, RecipeModel);
  }

  findByUserId(userId, isLoaded, done) {
    if(typeof done !== "function") done = Function.prototype;
    this.db
      .where('user_id', userId)
      .whereNull('recipes.deleted_at')
      //.select(["recipes".*, "F"."name" AS "food:name", "U"."name" AS "unit:name", "D"."direction" AS "direction:direction"])
      .select("recipes.*","F.name AS food:name", "U.name AS unit:name", "D.direction AS direction:direction")
      .innerJoin('recipes_ingredients AS RI', 'recipes.id', 'RI.recipe_id')
      .innerJoin('ingredients AS I', 'RI.ingredient_id', 'I.id')
      .innerJoin('foods AS F', 'F.id', 'I.food_id')
      .innerJoin('units AS U', 'U.id', 'I.unit_id')
      .innerJoin('recipes_directions AS RD', 'recipes.id', 'RD.recipe_id')
      .innerJoin('directions AS D', 'RD.direction_id', 'D.id')
      .then((recipes)=>done(null,recipes))
      .catch((err) => done(err));
  }

  findByTitle(title, isLoaded, done) {
    if(typeof done !== "function") done = Function.prototype;

    this.db
      .where('title', 'LIKE', `%${title}%`)
      .whereNull('deleted_at')
      .then((recipes)=>done(null, isLoaded ? this.loadRecipe(recipes,done) : recipes))
      .catch((err) => done(err));
  }

  loadRecipe(recipes, done) {
    this.db(recipes)
      .select('recipes.*, F.name AS food:name, U.name AS unit:name, D.direction AS direction:direction')

      .innerJoin('recipe-ingredients AS RI', 'recipes.id', 'RI.recipe_id')
        .innerJoin('ingredients AS I', 'RI.ingredient_id', 'I.id')
          .innerJoin('foods AS F', 'F.id', 'I.food_id')
          .innerJoin('units AS U', 'U.id', 'I.unit_id')

      .innerJoin('recipe-directions AS RD', 'recipes.id', 'RD.recipe_id')
        .innerJoin('directions AS D', 'RD.direction_id', 'D.id')

      .then((recipes)=>done(null, recipes))
      .catch((err)=>done(err))
  }
}

module.exports = new Recipe();
