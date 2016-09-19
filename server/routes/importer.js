const Errors = require('../utils/errors')
const Importer = require('../handlers/importer')
const ImporterSchema = require('../schemas/importer')

module.exports = [
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
  }
]
