const Admin = require('../handlers/admin')
const AuthRoutes = require('./auth')
const CookbookRoutes = require('./cookbook')
const DirectionRoutes = require('./direction')
const Errors = require('../utils/errors')
const FoodRoutes = require('./food')
const ImporterRoutes = require('./importer')
const IngredientRoutes = require('./ingredient')
const Ping = require('../handlers/ping')
const RecipeRoutes = require('./recipe')
const Units = require('./handlers/units')
const UnitSchema = require('../schemas/unit')
const UserRoutes = require('./user')

module.exports = [
  // Test
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin
  { method: 'GET', path: '/admin/users', handler: Admin.users },

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
].concat(AuthRoutes, CookbookRoutes, DirectionRoutes, FoodRoutes,
         ImporterRoutes, IngredientRoutes, RecipeRoutes, UserRoutes)
