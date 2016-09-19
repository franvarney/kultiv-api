const Errors = require('../utils/errors')
const Recipe = require('../handlers/recipe')
const RecipeSchema = require('../schemas/recipe')

module.exports = [
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
  {
    method: 'GET',
    path: '/users/{id}/recipes',
    handler: Recipe.allByUser
  },
  {
    method: 'GET',
    path: '/cookbooks/{id}/recipes',
    handler: Recipe.allByCookbook
  },
  {
    method: 'GET',
    path: '/recipes/{id}',
    handler: Recipe.get
  },
  {
    method: 'PUT',
    path: '/recipes/{id}',
    handler: Recipe.update
  },
  {
    method: 'DELETE',
    path: '/recipes/{id}',
    handler: Recipe.delete
  }
]
