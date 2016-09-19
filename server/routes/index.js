const Admin = require('../handlers/admin')
const AuthRoutes = require('./auth')
const CookbookRoutes = require('./cookbook')
const DirectionRoutes = require('./direction')
const FoodRoutes = require('./food')
const ImporterRoutes = require('./importer')
const IngredientRoutes = require('./ingredient')
const Ping = require('../handlers/ping')
const RecipeRoutes = require('./recipe')
const UnitRoutes = require('./unit')
const UserRoutes = require('./user')

module.exports = [
  // Test
  { method: 'GET', path: '/ping', handler: Ping, config: { auth: false } },

  // Admin
  { method: 'GET', path: '/admin/users', handler: Admin.users }
].concat(AuthRoutes, CookbookRoutes, DirectionRoutes, FoodRoutes,
         ImporterRoutes, IngredientRoutes, RecipeRoutes,
         UnitRoutes, UserRoutes)
