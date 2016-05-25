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

    this.knex(this.name)
      .select('id', 'owner_id', 'name', 'description',
              'is_private','created_at', 'updated_at')
      .where('owner_id', ownerUserId)
      .whereNull('deleted_at')
      .asCallback((err, cookbook) => {
        if (err) return Logger.error(err), done(err)

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
      .whereNull('deleted_at')
      .asCallback((err, cookbooks) => {
        if (err) return Logger.error(err), done(err)
        return done(null, cookbooks)
      })
  }
}

module.exports = new Cookbook()
