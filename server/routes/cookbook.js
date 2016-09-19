const Cookbook = require('../handlers/cookbook')
const CookbookPolicy = require('../policies/cookbook')
const CookbookSchema = require('../schemas/cookbook')
const Errors = require('../utils/errors')

const SCOPE = { scope: ['admin', 'user'] }

module.exports = [
  {
    method: 'POST',
    path: '/cookbooks',
    config: {
      auth: SCOPE,
      handler: Cookbook.create,
      validate: {
        payload: CookbookSchema.createPayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      }
    }
  },
  {
    method: 'GET',
    path: '/users/{id}/cookbooks',
    handler: Cookbook.allByUser
  },
  {
    method: 'GET',
    path: '/cookbooks/{id}',
    config: {
      auth: SCOPE,
      handler: Cookbook.get,
      pre: [
        {
          method: CookbookPolicy.authorizeUser,
          assign: 'user'
        }
      ]
    }
  },
  {
    method: 'PUT',
    path: '/cookbooks/{id}',
    config: {
      auth: SCOPE,
      handler: Cookbook.update,
      pre: [
        {
          method: CookbookPolicy.authorizeUser,
          assign: 'user'
        }
      ],
      validate: {
        payload: CookbookSchema.updatePayload,
        failAction: Errors.validate,
        options: { stripUnknown: true }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/cookbooks/{id}',
    config: {
      auth: SCOPE,
      handler: Cookbook.delete
    }
  }
]
