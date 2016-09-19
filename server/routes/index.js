const Admin = require('../handlers/admin')
const AuthRoutes = require('./auth')
const CookbookRoutes = require('./cookbook')
const DirectionRoutes = require('./direction')
const Foods = require('./handlers/foods')
const FoodSchema = require('../schemas/food')
const Errors = require('../utils/errors')
const Importer = require('../handlers/importer')
const ImporterSchema = require('../schemas/importer')
const Ingredients = require('./handlers/ingredients')
const IngredientSchema = require('../schemas/ingredient')
const Ping = require('../handlers/ping')
const Recipe = require('../handlers/recipe')
const RecipeSchema = require('../schemas/recipe')
const Units = require('./handlers/units')
const UnitSchema = require('../schemas/unit')
const UserRoutes = require('./user')

module.exports = [
  // Test
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin
  { method: 'GET', path: '/admin/users', handler: Admin.users },

  // Foods
  {
    method: 'POST',
    path: '/foods',
    config: {
      validate: {
        payload: FoodSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Foods.create
    }
  },
  { method: 'GET', path: '/foods/{id}', handler: Foods.get },

  // Importer
  {
    method: 'POST',
    path: '/importer',
    config: {
      validate: {
        query: ImporterSchema.createQuery,
        payload: ImporterSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Importer.create
    }
  },

  // Ingredients
  {
    method: 'POST',
    path: '/ingredients',
    config: {
      validate: {
        payload: IngredientSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Ingredients.create
    }
  },
  { method: 'GET', path: '/ingredients/{id}', handler: Ingredients.get },

  // Recipes
  { method: 'GET', path: '/users/{id}/recipes', handler: Recipe.allByUser },
  { method: 'GET', path: '/cookbooks/{id}/recipes', handler: Recipe.allByCookbook },
  { method: 'GET', path: '/recipes/{id}', handler: Recipe.get },
  {
    method: 'POST',
    path: '/recipes',
    config: {
      validate: {
        payload: RecipeSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Recipe.create
    }
  },
  { method: 'PUT', path: '/recipes/{id}', handler: Recipe.update },
  { method: 'DELETE', path: '/recipes/{id}', handler: Recipe.delete },

  // Units
  {
    method: 'POST',
    path: '/units',
    config: {
      validate: {
        payload: UnitSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Units.create
    }
  },
  { method: 'GET', path: '/units/{id}', handler: Units.get }
].concat(AuthRoutes, CookbookRoutes, DirectionRoutes, UserRoutes)
