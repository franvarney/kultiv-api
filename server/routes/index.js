const Admin = require('../handlers/admin')
const Auth = require('../handlers/auth')
const AuthSchema = require('../schemas/auth')
const Cookbook = require('../handlers/cookbook')
const CookbookSchema = require('../schemas/cookbook')
const Directions = require('./handlers/directions')
const DirectionSchema = require('../schemas/direction')
const Foods = require('./handlers/foods')
const FoodSchema = require('../schemas/food')
const Errors = require('../utils/errors')
const Importer = require('../handlers/importer')
const ImporterSchema = require('../schemas/importer')
const Ping = require('../handlers/ping')
const Recipe = require('../handlers/recipe')
const RecipeSchema = require('../schemas/recipe')
const Units = require('./handlers/units')
const UnitSchema = require('../schemas/unit')
const User = require('../handlers/user')
const UserSchema = require('../schemas/user')

module.exports = [
  // Test
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin
  { method: 'GET', path: '/admin/users', handler: Admin.users },

  // Auth
  {
    method: 'POST',
    path: '/auth',
    config: {
      auth: false,
      validate: {
        payload: AuthSchema.loginPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Auth.login
    }
  },
  { method: 'DELETE', path: '/auth', handler: Auth.logout },

  // Cookbooks
  { method: 'GET', path: '/users/{id}/cookbooks', handler: Cookbook.allByUser },
  { method: 'GET', path: '/cookbooks/{id}', handler: Cookbook.get },
  {
    method: 'POST',
    path: '/cookbooks',
    config: {
      validate: {
        payload: CookbookSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Cookbook.create
    }
  },
  {
    method: 'PUT',
    path: '/cookbooks/{id}',
    config: {
      validate: {
        payload: CookbookSchema.updatePayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Cookbook.update
    }
  },
  { method: 'DELETE', path: '/cookbooks/{id}', handler: Cookbook.delete },

  // Directions
  {
    method: 'POST',
    path: '/directions',
    config: {
      validate: {
        payload: DirectionSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: Directions.create
    }
  },
  { method: 'GET', path: '/directions/{id}', handler: Directions.get },

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
  { method: 'GET', path: '/units/{id}', handler: Units.get },

  // Users
  { method: 'GET', path: '/users/{id}', handler: User.get },
  {
    method: 'POST',
    path: '/users',
    config: {
      auth: false,
      validate: {
        payload: UserSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: User.create
    }
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    config: {
      validate: {
        payload: UserSchema.updatePayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      },
      handler: User.update
    }
  },
  { method: 'DELETE', path: '/users/{id}', handler: User.delete }
]
