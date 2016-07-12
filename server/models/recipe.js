const Logger = require('franston')('server:models:recipe')

const Base = require('./base')
const RecipeSchema = require('../schemas/recipe')

const TABLE_NAME = 'recipes'

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
}

const ingredients = function (queryBuilder) {
  queryBuilder
    .select('I.id AS ingredients:id', 'I.amount AS ingredients:amount',
            'IU.name AS ingredients:unit', 'F.name AS ingredients:food',
            'I.optional AS ingredients:optional')
    .innerJoin('recipes_ingredients AS RI', 'recipes.id', 'RI.recipe_id')
      .innerJoin('ingredients AS I', 'I.id', 'RI.ingredient_id')
        .innerJoin('foods AS F', 'I.food_id', 'F.id')
        .innerJoin('units AS IU', 'I.unit_id', 'IU.id')
}

const directions = function (queryBuilder) {
  queryBuilder
    .select('D.id AS directions:id', 'D.direction AS directions:direction')
    .innerJoin('recipes_directions AS RD', 'recipes.id', 'RD.recipe_id')
      .innerJoin('directions AS D', 'RD.direction_id', 'D.id')
}

const cookbook = function (cookbookId, queryBuilder) {
  queryBuilder
    .innerJoin('cookbooks_recipes AS CR', 'CR.recipe_id', 'recipes.id')
    .where('CR.cookbook_id', cookbookId)
    .whereNull('CR.deleted_at')
}

class Recipe extends Base {
  constructor () {
    super(TABLE_NAME, RecipeSchema.general)
  }

  create (payload, done) {
    // transaction
    // // insert recipe
    // // connect cookbook-recipe
    // // insert ingredients
    // // connect recipe-ingredient
    // // insert directions
    // // connect recipe-direction
  }

  findById (id, done) {
    Logger.debug('recipe.findById')

    this.knex(this.name)
      .select('recipes.id', 'recipes.title', 'recipes.cook_time',
            'recipes.prep_time', 'recipes.description', 'recipes.is_private',
            'recipes.created_at', 'recipes.updated_at',
            'recipes.user_id AS creator_id', 'U.username AS creator_username',
            'recipes.yield_amount', 'RU.name AS yields_unit')
        .innerJoin('users AS U', 'U.id', 'recipes.user_id')
        .innerJoin('units AS RU', 'RU.id', 'recipes.yield_unit_id')
      .where('recipes.id', id)
      .whereNull('recipes.deleted_at')
      .asCallback((err, found) => {
        if (err) return Logger.error(err), done(err)
        return done(null, found)
      })
  }

  findByUserId (userId, isLoaded, done) {
    Logger.debug('recipe.findByUserId')
    this.loadRecipe(`recipes.user_id = ${userId}`, isLoaded, done)
  }

  findByCookbookId (cookbookId, isLoaded, done) {
    Logger.debug('recipe.findByCookbookdId')

    if (typeof isLoaded === 'function') {
      done = isLoaded
      isLoaded = false
    }

    if (!done) done = Function.prototype

    if (!isLoaded) {
      this.knex(this.name)
        .modify(baseRecipe)
        .modify(cookbook.bind(null, cookbookId))
        .asCallback((err, recipes) => {
          if (err) return Logger.error(err), done(err)
          return done(null, recipes)
        })
    } else {
      this.knex(this.name)
        .modify(baseRecipe)
        .modify(cookbook.bind(null, cookbookId))
        .modify(ingredients)
        .modify(directions)
        .asCallback((err, recipes) => {
          if (err) return Logger.error(err), done(err)
          return done(null, recipes)
        })
    }
  }

  findByTitle (title, isLoaded, done) {
    Logger.debug('recipe.findByTitle')
    this.loadRecipe(`recipes.title LIKE %${title}%`, isLoaded, done)
  }

  loadRecipe (rawQuery, isLoaded, done) {
    Logger.debug('recipe.loadRecipe')

    if (typeof isLoaded === 'function') {
      done = isLoaded
      isLoaded = false
    }

    if (!done) done = Function.prototype

    if (!isLoaded) {
      this.knex(this.name)
        .whereRaw(rawQuery)
        .modify(baseRecipe)
        .asCallback((err, recipes) => {
          if (err) return Logger.error(err), done(err)
          return done(null, recipes)
        })
    } else {
      this.knex(this.name)
        .whereRaw(rawQuery)
        .modify(baseRecipe)
        .modify(ingredients)
        .modify(directions)
        .asCallback((err, recipes) => {
          if (err) return Logger.error(err), done(err)
          return done(null, recipes)
        })
    }
  }
}

module.exports = Recipe
