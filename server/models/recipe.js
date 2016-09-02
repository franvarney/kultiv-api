const Logger = require('franston')('server:models:recipe')
const Waterfall = require('run-waterfall')

const Model = require('./base')
const CookbookRecipe = require('./cookbook-recipe')
const Ingredient = require('./ingredient')
const RecipeDirection = require('./recipe-direction')
const RecipeIngredient = require('./recipe-ingredient')
const RecipeSchema = require('../schemas/recipe')
const Unit = require('./unit')

const TABLE_NAME = 'recipes'

// TODO add transactions

function baseRecipe (queryBuilder) {
  queryBuilder
    .select('recipes.id', 'recipes.title', 'recipes.cook_time',
            'recipes.prep_time', 'recipes.description', 'recipes.is_private',
            'recipes.source_type AS source:type', 'recipes.source_value AS source:value',
            'recipes.created_at', 'recipes.updated_at',
            'recipes.user_id AS creator:id', 'U.username AS creator:username',
            'recipes.yield_amount AS yields-:amount', 'RU.name AS yields-:unit')
    .innerJoin('users AS U', 'U.id', 'recipes.user_id')
    .innerJoin('units AS RU', 'RU.id', 'recipes.yield_unit_id')
    .whereNull('recipes.deleted_at')
}

function ingredients (queryBuilder) {
  queryBuilder
    .select('I.id AS ingredients:id', 'I.amount AS ingredients:amount',
            'IU.name AS ingredients:unit', 'F.name AS ingredients:food',
            'I.optional AS ingredients:optional')
    .innerJoin('recipes_ingredients AS RI', 'recipes.id', 'RI.recipe_id')
      .innerJoin('ingredients AS I', 'I.id', 'RI.ingredient_id')
        .innerJoin('foods AS F', 'I.food_id', 'F.id')
        .innerJoin('units AS IU', 'I.unit_id', 'IU.id')
}

function directions (queryBuilder) {
  queryBuilder
    .select('D.id AS directions:id', 'D.direction AS directions:direction')
    .innerJoin('recipes_directions AS RD', 'recipes.id', 'RD.recipe_id')
      .innerJoin('directions AS D', 'RD.direction_id', 'D.id')
}

function cookbook (cookbookId, queryBuilder) {
  queryBuilder
    .innerJoin('cookbooks_recipes AS CR', 'CR.recipe_id', 'recipes.id')
    .where('CR.cookbook_id', cookbookId)
    .whereNull('CR.deleted_at')
}

function loadRecipe (query, isLoaded, done) {
  Logger.debug('recipe.loadRecipe')

  query.modify(baseRecipe)

  if (!isLoaded) {
    query.asCallback((err, recipes) => {
      if (err) return Logger.error(err), done(err)
      return done(null, recipes)
    })
  } else {
    query.modify(ingredients)
         .modify(directions)
         .asCallback((err, recipes) => {
           if (err) return Logger.error(err), done(err)
           return done(null, recipes)
         })
  }
}

const Recipe = Model.createModel({
  name: TABLE_NAME,
  schema: RecipeSchema.general,

  create (done) {
    Unit
      .set({ name: this.data.yield_unit })
      .findOrCreate((err, id) => {
        if (err) {
          if (this._rollback()) this._trxRollback()
          return this._errors(err, done)
        }

        this.data.yield_unit_id = id
        return this._create(done)
      })
  },

  findById (isLoaded, done) {
    Logger.debug('recipe.findById')

    if (typeof isLoaded === 'function') {
      done = isLoaded
      isLoaded = false
    }

    let query = this.knex(this.name)
                    .where('recipes.id', this.data.id)
                    .first()

    return loadRecipe(query, isLoaded, (err, recipe) => {
      if (err) return Logger.error(err), done(err)

      if (!recipe) {
        let err = 'Recipe Not Found'
        return Logger.error(err), done(['notFound', err])
      }

      return done(null, recipe)
    })
  },

  findByUserId (isLoaded, done) {
    Logger.debug('recipe.findByUserId')

    if (typeof isLoaded === 'function') {
      done = isLoaded
      isLoaded = false
    }

    let query = this.knex(this.name)
                    .whereRaw(`recipes.user_id = ${this.data.user_id}`)

    return loadRecipe(query, isLoaded, done)
  },

  findByCookbookId (isLoaded, done) { // TODO refactor this later
    Logger.debug('recipe.findByCookbookdId')

    if (typeof isLoaded === 'function') {
      done = isLoaded
      isLoaded = false
    }

    let query = this.knex(this.name)
                    .modify(cookbook.bind(null, this.data.cookbook_id))

    return loadRecipe(query, isLoaded, done)
  },

  findByTitle (isLoaded, done) {
    Logger.debug('recipe.findByTitle')

    if (typeof isLoaded === 'function') {
      done = isLoaded
      isLoaded = false
    }

    let query = this.knex(this.name)
                    .whereRaw(`recipes.title LIKE %${this.data.title}%`)

    return loadRecipe(query, isLoaded, done)
  }
})

module.exports = Recipe
