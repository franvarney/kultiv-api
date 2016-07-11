const Logger = require('franston')('server:models:cookbook')

const Base = require('./base')
const CookbookSchema = require('../schemas/cookbook')

const TABLE_NAME = 'cookbooks'

class Cookbook extends Base {
  constructor () {
    super(TABLE_NAME, CookbookSchema.general)
  }

  findByOwner (ownerUserId, done) {
    Logger.debug('cookbook.findByOwner')

    this.knex(this.name)
      .select('cookbooks.id', 'cookbooks.name', 'cookbooks.description',
              'cookbooks.is_private','cookbooks.created_at',
              'cookbooks.updated_at', 'U.id AS creator:id',
              'U.username AS creator:username')
      .innerJoin('users AS U', 'U.id', 'cookbooks.owner_id')
      .where('owner_id', ownerUserId)
      .whereNull('cookbooks.deleted_at')
      .asCallback((err, cookbook) => {
        if (err) return Logger.error(err), done(err)
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

module.exports = Cookbook
