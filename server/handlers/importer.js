const Logger = require('franston')('server:handlers:importer')
const Treeize = require('treeize')

const Errors = require('../utils/errors')
const ForkImporter = require('../services/importer/fork')
const PartialImporter = require('../services/importer/partial')

exports.create = function (request, reply) {
  let importer = Function.prototype
  let willTreeize = false

  switch (request.query.type) {
    case 'manual':
      importer = PartialImporter.bind(null, request.payload)
      break
    case 'fork':
      importer = ForkImporter.bind(null, request.payload)
      willTreeize = true
      break
  }

  let treeize = new Treeize()

  importer((err, recipe) => {
    if (err) return Logger.error(err), reply(Errors.get(err))

    if (willTreeize) recipe = treeize.grow(recipe).getData()
    return reply(recipe).code(201)
  })
}
