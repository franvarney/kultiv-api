const Logger = require('franston')('server:models:cookbook')
const Treeize = require('treeize')

const Base = require('./base')
const CookbookSchema = require('../schemas/cookbook')

const TABLE_NAME = 'cookbooks'
let treeize = new Treeize({ output: { prune: false } })

class Cookbook extends Base {
  constructor () {
    super(TABLE_NAME, CookbookSchema)
  }

  findByOwner (ownerUserId, done) {
    Logger.debug('cookbook.findByOwner')

    this.knex('users')
      .select('users.*', 'C.id AS cookbooks:id', 'C.name AS cookbooks:name',
              'C.description AS cookbooks:description',
              'C.is_private AS cookbooks:is_private',
              'C.created_at AS cookbooks:created_at',
              'C.updated_at AS cookbooks:updated_at')
      .where('users.id', ownerUserId)
      .innerJoin('cookbooks as C', 'users.id', 'C.owner_id')
      .asCallback((err, cookbook) => {
        if (err) return Logger.error(err), done(err)

        cookbook = treeize.grow(cookbook).getData()[0]
        delete cookbook.password
        delete cookbook.auth_token

        return done(null, cookbook)
      })
  }

  findByCollaborator (collaboratorUserId, done) {
    Logger.debug('cookbook.findByCollaborator')

    this.knex(this.name)
      .innerJoin('cookbooks-collaborators AS CC', 'cookbooks.id',
                 'CC.collaborator_id')
      .whereNull('cookbooks.deleted_at')
      .where('CC.collaborator_id', collaboratorUserId)
      .asCallback((err, cookbooks) => {
        if (err) return Logger.error(err), done(err)
        return done(null, cookbooks)
      })
  }
}

module.exports = new Cookbook()
