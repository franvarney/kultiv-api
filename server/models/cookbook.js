const Logger = require('franston')('server:models:cookbook')

const Base = require('./base')
const CookbookSchema = require('../schemas/cookbook')

const TABLE_NAME = 'cookbooks'

class Cookbook extends Base {
  constructor (data) {
    super(TABLE_NAME, CookbookSchema.general, data)
  }

  findByOwner (done) {
    Logger.debug('cookbook.findByOwner')

    this.knex(this.name)
      .select('cookbooks.id', 'cookbooks.name', 'cookbooks.description',
              'cookbooks.is_private','cookbooks.created_at',
              'cookbooks.updated_at', 'U.id AS creator:id',
              'U.username AS creator:username')
      .innerJoin('users AS U', 'U.id', 'cookbooks.owner_id')
      .where('owner_id', this.payload.owner_id)
      .whereNull('cookbooks.deleted_at')
      .transacting(this.trx)
      .asCallback((err, cookbook) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }

        if (this.trx && this.willCommit) {
          Logger.debug('Transaction Completed'), this.trx.commit()
        }
        return done(null, cookbook)
      })
  }

  findByCollaborator (done) {
    Logger.debug('cookbook.findByCollaborator')

    this.knex(this.name)
      .innerJoin('cookbooks-collaborators AS CC', 'cookbooks.id',
                 'CC.collaborator_id')
      .whereNull('cookbooks.deleted_at')
      .where('CC.collaborator_id', this.payload.collaborator_id)
      .whereNull('deleted_at')
      .transacting(this.trx)
      .asCallback((err, cookbooks) => {
        if (err) {
          if (this.trx) {
            Logger.error('Transaction Failed'), this.trx.rollback()
          }
          return Logger.error(err), done(err)
        }

        if (this.trx && this.willCommit) {
          Logger.debug('Transaction Completed'), this.trx.commit()
        }
        return done(null, cookbooks)
      })
  }
}

module.exports = Cookbook
