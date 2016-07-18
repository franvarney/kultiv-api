const Logger = require('franston')('server:models:recipe')
const Waterfall = require('run-waterfall')

const Base = require('./base')
const CookbookRecipeModel = require('./cookbook-recipe')
const DirectionModel = require('./direction')
const FoodModel = require('./food')
const IngredientModel = require('./ingredient')
const RecipeDirectionModel = require('./recipe-direction')
const RecipeIngredientModel = require('./recipe-ingredient')
const RecipeSchema = require('../schemas/recipe')
const UnitModel = require('./unit')

const CookbookRecipe = new CookbookRecipeModel()
const Direction = new DirectionModel()
const Food = new FoodModel()
const Ingredient = new IngredientModel()
const RecipeDirection = new RecipeDirectionModel()
const RecipeIngredient = new RecipeIngredientModel()
const TABLE_NAME = 'recipes'
const Unit = new UnitModel()

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

  create (payload, cookbookId, done) {
    let that = this

    this.knex.transaction((trx) => {
      let directions = payload.directions
      let ingredients = payload.ingredients
      let foods = ingredients.map((ingredient) => ingredient.food)
      let units = ingredients.map((ingredient) => ingredient.unit)
      let recipeId

      // TODO add manual, source_value property

      Waterfall([
        // get unit id for yields
        function (callback) {
          Unit.findOrCreate(payload.yield_unit, trx, (err, yieldUnit) => {
            if (err) return callback(err)
            payload.yield_unit_id = yieldUnit.id
            return callback()
          })
        },
        // create the recipe
        // TODO check if entire recipe exists first
        super.create.bind(that, payload, trx),
        // get unit ids for each ingredient
        function (id, callback) {
          recipeId = id

          Unit.batchFindOrCreate(units, trx, (err, foundOrCreatedUnits) => {
            if (err) return callback(err)

            let unitMap = new Map()
            foundOrCreatedUnits.forEach((unit) => {
              if (!unitMap.get(unit.name)) {
                unitMap.set(unit.name, { unit_id: unit.id, unit: unit.name })
              }
            })

            ingredients = payload.ingredients.map((ingredient) =>{
              return Object.assign(ingredient, unitMap.get(ingredient.unit))
            })

            return callback()
          })
        },
        // get food ids for each food
        function (callback) {
          Food.batchFindOrCreate(foods, trx, (err, foundOrCreatedFoods) => {
            if (err) return callback(err)

            let foodMap = new Map()
            foundOrCreatedFoods.forEach((food) => {
              if (!foodMap.get(food.name)) {
                foodMap.set(food.name, { food_id: food.id, food: food.name })
              }
            })

            ingredients = payload.ingredients.map((ingredient) =>{
              return Object.assign(ingredient, foodMap.get(ingredient.food))
            })

            return callback()
          })
        },
        // create ingredients
        function (callback) {
          return Ingredient.batchFindOrCreate(
            ingredients.map((ingredient) => {
              let {amount, unit_id, food_id, optional} = ingredient
              return { amount, unit_id, food_id, optional }
            }), trx, callback)
        },
        // create recipe ingredients
        function (ingredientIds, callback) {
          return RecipeIngredient.batchFindOrCreate(
            ingredientIds.map((ingredientId) => {
              return { recipe_id: recipeId, ingredient_id: ingredientId }
            }), trx, callback)
        },
        // create directions
        function (recipeIngredientIds, callback) {
          return Direction.batchFindOrCreate(directions, trx, callback)
        },
        // create recipe directions
        function (directionIds, callback) {
          return RecipeDirection.batchFindOrCreate(
            directionIds.map((directionId) => {
              return { recipe_id: recipeId, direction_id: directionId }
            }), trx, callback)
        }
       ], (err) => {
        if (err) {
          if (trx) Logger.error('Transaction Failed'), trx.rollback(err)
          return Logger.error(err), done(err)
        }

        if (trx) Logger.debug('Transaction Completed'), trx.commit()

        // attach to cookbook if cookbook is selected
        if (payload.cookbook_id) {
          let {cookbook_id} = payload
          return CookbookRecipe.findOrCreate({
              cookbook_id,
              recipe_id: recipeId
            }, done.bind(null, null, recipeId))
        }

        return done(null, recipeId)
      })
    })
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

  findByCookbookId (cookbookId, isLoaded, done) { // TODO refactor this later
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
